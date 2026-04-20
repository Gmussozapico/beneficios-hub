const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean benefits on re-seed
  await prisma.benefit.deleteMany({});

  // ── Categories ────────────────────────────────────────────────────────
  const bancosCategory = await prisma.providerCategory.upsert({
    where: { slug: 'banco' },
    update: {},
    create: { name: 'Banco', slug: 'banco', icon: '🏦' },
  });
  const telefoniaCategory = await prisma.providerCategory.upsert({
    where: { slug: 'telefonia' },
    update: {},
    create: { name: 'Telefonía', slug: 'telefonia', icon: '📱' },
  });
  const retailCategory = await prisma.providerCategory.upsert({
    where: { slug: 'retail' },
    update: {},
    create: { name: 'Retail', slug: 'retail', icon: '🛍️' },
  });
  const segurosCategory = await prisma.providerCategory.upsert({
    where: { slug: 'seguros' },
    update: {},
    create: { name: 'Seguros', slug: 'seguros', icon: '🛡️' },
  });
  const entretenimientoCategory = await prisma.providerCategory.upsert({
    where: { slug: 'entretenimiento' },
    update: {},
    create: { name: 'Entretenimiento', slug: 'entretenimiento', icon: '🎬' },
  });

  // ── Providers ─────────────────────────────────────────────────────────
  const providerDefs = [
    { name: 'BCI', slug: 'bci', description: 'Banco de Crédito e Inversiones - tarjetas y beneficios exclusivos', logoUrl: 'https://www.google.com/s2/favicons?domain=bci.cl&sz=128', categoryId: bancosCategory.id },
    { name: 'Santander', slug: 'santander', description: 'Banco Santander Chile - hasta 50% en restaurantes y más', logoUrl: 'https://www.google.com/s2/favicons?domain=santander.cl&sz=128', categoryId: bancosCategory.id },
    { name: 'Banco de Chile', slug: 'banco-de-chile', description: 'Banco de Chile - Club de Beneficios exclusivos Martes y más', logoUrl: 'https://www.google.com/s2/favicons?domain=bancochile.cl&sz=128', categoryId: bancosCategory.id },
    { name: 'Itaú', slug: 'itau', description: 'Banco Itaú Chile - descuentos y promociones para tarjetahabientes', logoUrl: 'https://www.google.com/s2/favicons?domain=itau.cl&sz=128', categoryId: bancosCategory.id },
    { name: 'Scotiabank', slug: 'scotiabank', description: 'Scotiabank Chile - beneficios en gastronomía, deporte y más', logoUrl: 'https://www.google.com/s2/favicons?domain=scotiabank.cl&sz=128', categoryId: bancosCategory.id },
    { name: 'Banco Security', slug: 'banco-security', description: 'Banco Security - beneficios exclusivos para clientes Premium', logoUrl: 'https://www.google.com/s2/favicons?domain=security.cl&sz=128', categoryId: bancosCategory.id },
    { name: 'Banco Falabella', slug: 'banco-falabella', description: 'Banco Falabella - CMR Visa y beneficios en el ecosistema Falabella', logoUrl: 'https://www.google.com/s2/favicons?domain=bancofalabella.cl&sz=128', categoryId: bancosCategory.id },
    { name: 'BancoEstado', slug: 'banco-estado', description: 'BancoEstado - beneficios para Cuenta RUT y tarjetas', logoUrl: 'https://www.google.com/s2/favicons?domain=bancoestado.cl&sz=128', categoryId: bancosCategory.id },
    { name: 'Entel', slug: 'entel', description: 'Entel - Club Entel con descuentos en cine, café, restaurantes y más', logoUrl: 'https://www.google.com/s2/favicons?domain=entel.cl&sz=128', categoryId: telefoniaCategory.id },
    { name: 'Movistar', slug: 'movistar', description: 'Movistar Chile - Club Movistar con beneficios en entretenimiento', logoUrl: 'https://www.google.com/s2/favicons?domain=movistar.cl&sz=128', categoryId: telefoniaCategory.id },
    { name: 'Claro', slug: 'claro', description: 'Claro Chile - Club Claro con descuentos en comercios y streaming', logoUrl: 'https://www.google.com/s2/favicons?domain=claro.cl&sz=128', categoryId: telefoniaCategory.id },
    { name: 'WOM', slug: 'wom', description: 'WOM Chile - beneficios en cine, café y entretenimiento', logoUrl: 'https://www.google.com/s2/favicons?domain=wom.cl&sz=128', categoryId: telefoniaCategory.id },
    { name: 'CMR Falabella', slug: 'cmr-falabella', description: 'Tarjeta CMR Falabella - descuentos permanentes en Falabella y partners', logoUrl: 'https://www.google.com/s2/favicons?domain=falabella.com&sz=128', categoryId: retailCategory.id },
    { name: 'Ripley Card', slug: 'ripley-card', description: 'Tarjeta Ripley - beneficios en Ripley y red de partners', logoUrl: 'https://www.google.com/s2/favicons?domain=ripley.cl&sz=128', categoryId: retailCategory.id },
    { name: 'La Polar Card', slug: 'la-polar-card', description: 'Tarjeta La Polar - descuentos y cuotas sin interés', logoUrl: 'https://www.google.com/s2/favicons?domain=lapolar.cl&sz=128', categoryId: retailCategory.id },
    { name: 'MetLife', slug: 'metlife', description: 'MetLife Chile - seguros y beneficios de salud y bienestar', logoUrl: 'https://www.google.com/s2/favicons?domain=metlife.cl&sz=128', categoryId: segurosCategory.id },
  ];

  const P = {}; // map slug → id
  for (const p of providerDefs) {
    const created = await prisma.provider.upsert({
      where: { slug: p.slug },
      update: { logoUrl: p.logoUrl, description: p.description },
      create: p,
    });
    P[p.slug] = created.id;
  }

  // Helper
  const b = (slug, title, desc, discount, type, category, opts = {}) => ({
    title,
    description: desc,
    discount,
    type,
    category,
    providerId: P[slug],
    isActive: true,
    validDays: opts.validDays || [],
    merchant: opts.merchant || null,
    location: opts.location || null,
    minPurchase: opts.minPurchase || null,
    maxDiscount: opts.maxDiscount || null,
    url: opts.url || null,
    terms: opts.terms || null,
    validUntil: opts.validUntil || null,
  });

  const benefits = [
    // ═══════════════════════════════════════════════════════════
    // BCI — 15 benefits
    // ═══════════════════════════════════════════════════════════
    b('bci', '30% dcto en Starbucks los Martes', 'Descuento en todas las bebidas y alimentos de Starbucks pagando con tarjeta BCI.', '30%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', validDays: [2], maxDiscount: 3000, terms: 'Solo los días martes. Máximo $3.000 de descuento.' }),
    b('bci', '20% dcto en Juan Valdez Café', 'Descuento en bebidas y alimentos en Juan Valdez con tarjeta BCI.', '20%', 'PERCENTAGE', 'Café', { merchant: 'Juan Valdez', terms: 'Válido en todas las sucursales. No incluye mercancía.' }),
    b('bci', '25% dcto en Burger King', 'Obtén 25% de descuento en tu pedido en Burger King con BCI.', '25%', 'PERCENTAGE', 'Restaurante', { merchant: 'Burger King', minPurchase: 8000, terms: 'Mínimo $8.000. Máximo 2 usos por semana.' }),
    b('bci', '30% dcto en restaurantes adheridos Fin de Semana', 'Descuento en más de 150 restaurantes adheridos a BCI los fines de semana.', '30%', 'PERCENTAGE', 'Restaurante', { validDays: [0, 6], maxDiscount: 15000, terms: 'Sábados y domingos. Máximo $15.000 por transacción.' }),
    b('bci', '2x1 en Cinemark (Lun a Jue)', 'Lleva a un acompañante gratis a cualquier función en Cinemark de lunes a jueves.', '2x1', 'FREEBIE', 'Cine', { merchant: 'Cinemark', validDays: [1, 2, 3, 4], terms: 'Excluye estrenos y funciones 3D premium.' }),
    b('bci', '25% dcto en Cinépolis', 'Descuento en entradas para cualquier función en Cinépolis.', '25%', 'PERCENTAGE', 'Cine', { merchant: 'Cinépolis', terms: 'Válido de lunes a domingo. Excluye funciones Macro XE.' }),
    b('bci', '20% dcto en Cruz Verde', 'Descuento en farmacias Cruz Verde con tarjeta BCI.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', minPurchase: 5000, terms: 'No incluye medicamentos con receta controlada.' }),
    b('bci', '15% dcto en Farmacias Ahumada', 'Ahorra en productos de salud y cuidado personal en Ahumada.', '15%', 'PERCENTAGE', 'Salud', { merchant: 'Farmacias Ahumada', terms: 'No aplica a medicamentos de venta bajo receta.' }),
    b('bci', '15% dcto en Ripley Moda', 'Descuento en ropa, calzado y accesorios en tiendas Ripley.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'Ripley', terms: 'Solo en sección moda. Excluye electrónica.' }),
    b('bci', '10% dcto en Falabella', 'Descuento en moda, calzado y accesorios en Falabella.', '10%', 'PERCENTAGE', 'Moda', { merchant: 'Falabella', terms: 'No aplica en electrónica ni línea blanca.' }),
    b('bci', '10% dcto en LATAM Airlines', 'Descuento en pasajes nacionales e internacionales LATAM.', '10%', 'PERCENTAGE', 'Viajes', { merchant: 'LATAM', url: 'https://www.latamairlines.com', terms: 'Válido en latamairlines.com. No aplica en impuestos.' }),
    b('bci', '5% cashback en Booking.com', 'Cashback al reservar hoteles y alojamientos en Booking.com.', '5%', 'PERCENTAGE', 'Viajes', { merchant: 'Booking.com', minPurchase: 50000, terms: 'Se acredita en cuenta BCI en 30 días.' }),
    b('bci', '30% dcto en SmartFit', 'Membresía mensual SmartFit con 30% de descuento pagando con BCI.', '30%', 'PERCENTAGE', 'Deporte', { merchant: 'SmartFit', minPurchase: 20000, terms: 'Aplica en planes mensuales. No acumulable.' }),
    b('bci', '3 meses gratis Spotify Premium', 'Obtén 3 meses de Spotify Premium sin costo con BCI.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores de Spotify Premium.' }),
    b('bci', '15% dcto en Ticketmaster', 'Descuento en entradas para conciertos y eventos en Ticketmaster.', '15%', 'PERCENTAGE', 'Eventos', { merchant: 'Ticketmaster', terms: 'Sujeto a disponibilidad de eventos participantes.' }),

    // ═══════════════════════════════════════════════════════════
    // Santander — 15 benefits
    // ═══════════════════════════════════════════════════════════
    b('santander', '50% dcto en restaurantes (Sáb y Dom)', 'Hasta 50% de descuento en más de 300 restaurantes adheridos a Santander.', '50%', 'PERCENTAGE', 'Restaurante', { validDays: [0, 6], maxDiscount: 20000, terms: 'Sábados y domingos. Máximo $20.000 de descuento por visita.' }),
    b('santander', '2x1 en Starbucks los Martes', 'Compra una bebida y lleva la segunda gratis en Starbucks los martes.', '2x1', 'FREEBIE', 'Café', { merchant: 'Starbucks', validDays: [2], terms: 'Bebida de igual o menor valor. Solo martes.' }),
    b('santander', '50% dcto en Cinemark los Miércoles', 'Descuento de 50% en cualquier función de Cinemark los miércoles.', '50%', 'PERCENTAGE', 'Cine', { merchant: 'Cinemark', validDays: [3], maxDiscount: 5000, terms: 'Solo los días miércoles. Funciones 2D.' }),
    b('santander', '20% dcto en Cine Hoyts', 'Descuento en entradas para funciones en Cine Hoyts.', '20%', 'PERCENTAGE', 'Cine', { merchant: 'Hoyts', validDays: [1, 2, 3], terms: 'Lunes a miércoles. No aplica en 3D premium.' }),
    b('santander', '25% dcto en Cruz Verde', 'Descuento en medicamentos y productos de salud en Cruz Verde.', '25%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No incluye medicamentos con receta. Válido en todas las sucursales.' }),
    b('santander', '20% dcto en Farmacias SalcoBrand', 'Ahorra en SalcoBrand con tu tarjeta Santander.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'SalcoBrand', terms: 'Productos de venta libre y cuidado personal.' }),
    b('santander', '20% dcto en H&M', 'Descuento en toda la tienda H&M pagando con Santander.', '20%', 'PERCENTAGE', 'Moda', { merchant: 'H&M', terms: 'No acumulable con otras promociones. Tiendas físicas.' }),
    b('santander', '15% dcto en Zara', 'Descuento en Zara con tarjeta Santander.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'Zara', terms: 'Solo en tiendas físicas Zara Chile.' }),
    b('santander', '25% dcto en pedidos Uber Eats', 'Descuento en tus pedidos de Uber Eats con Santander.', '25%', 'PERCENTAGE', 'Restaurante', { merchant: 'Uber Eats', minPurchase: 8000, maxDiscount: 5000, terms: 'Mínimo $8.000. Máximo 4 usos por mes.' }),
    b('santander', '50% dcto primer mes Netflix', 'Mitad de precio en tu primer mes de Netflix con Santander.', '50%', 'PERCENTAGE', 'Streaming', { merchant: 'Netflix', maxDiscount: 5000, terms: 'Solo para nuevos suscriptores. Aplica plan estándar.' }),
    b('santander', '3 meses gratis Spotify', 'Disfruta 3 meses de Spotify Premium gratis con Santander.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores.' }),
    b('santander', '5% cashback en Lider/Walmart', 'Cashback en tus compras de supermercado en Lider.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Lider', terms: 'Mínimo $20.000. Excluye licores y tabaco.' }),
    b('santander', '$5.000 dcto en COPEC', 'Acumula $5.000 de descuento al cargar combustible en COPEC.', '$5.000', 'AMOUNT', 'Combustible', { merchant: 'COPEC', minPurchase: 50000, terms: 'Máximo 1 uso por mes. Estaciones COPEC seleccionadas.' }),
    b('santander', '20% dcto en Adidas', 'Descuento en ropa y calzado Adidas con Santander.', '20%', 'PERCENTAGE', 'Deporte', { merchant: 'Adidas', terms: 'Tiendas oficiales Adidas. No aplica outlet.' }),
    b('santander', '30% dcto en hoteles Booking.com', 'Hasta 30% de descuento al reservar hoteles en Booking.com.', '30%', 'PERCENTAGE', 'Viajes', { merchant: 'Booking.com', minPurchase: 50000, terms: 'Hoteles seleccionados. Reserva con 7 días de anticipación.' }),

    // ═══════════════════════════════════════════════════════════
    // Banco de Chile — 15 benefits
    // ═══════════════════════════════════════════════════════════
    b('banco-de-chile', '20% dcto en restaurantes los Martes', 'Descuento en restaurantes adheridos al Club Chile los días martes.', '20%', 'PERCENTAGE', 'Restaurante', { validDays: [2], maxDiscount: 12000, terms: 'Solo los días martes. Más de 200 restaurantes adheridos.' }),
    b('banco-de-chile', '2x1 en Cinemark los Martes', 'Compra una entrada y lleva a un acompañante gratis los martes.', '2x1', 'FREEBIE', 'Cine', { merchant: 'Cinemark', validDays: [2], terms: 'Solo funciones 2D los días martes.' }),
    b('banco-de-chile', '20% dcto en Starbucks', 'Descuento en bebidas y alimentos de Starbucks con Banco de Chile.', '20%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', terms: 'No incluye mercancía ni packs.' }),
    b('banco-de-chile', '15% dcto en Juan Valdez', 'Ahorra en café y alimentos de Juan Valdez con Banco de Chile.', '15%', 'PERCENTAGE', 'Café', { merchant: 'Juan Valdez', terms: 'Válido en todas las sucursales.' }),
    b('banco-de-chile', '25% dcto en Cruz Verde', 'Descuento en Cruz Verde con tarjeta Banco de Chile.', '25%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('banco-de-chile', '20% dcto en SalcoBrand', 'Ahorra en SalcoBrand con tu tarjeta del Chile.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'SalcoBrand', terms: 'Productos de venta libre.' }),
    b('banco-de-chile', '15% dcto en Falabella Moda', 'Descuento en ropa y accesorios en Falabella.com con Banco de Chile.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'Falabella', minPurchase: 30000, terms: 'Excluye tecnología y electrodomésticos.' }),
    b('banco-de-chile', '15% dcto en Paris', 'Descuento en ropa, calzado y accesorios en tiendas Paris.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'Paris', terms: 'No aplica electrónica ni línea blanca.' }),
    b('banco-de-chile', '20% dcto en Lider los Miércoles', 'Descuento en Lider y Walmart Express los días miércoles.', '20%', 'PERCENTAGE', 'Supermercado', { merchant: 'Lider', validDays: [3], minPurchase: 15000, terms: 'Solo miércoles. Compra mínima $15.000.' }),
    b('banco-de-chile', '5% cashback en Unimarc', 'Cashback en supermercados Unimarc con tarjeta del Chile.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Unimarc', terms: 'Se acredita en cuenta en 30 días.' }),
    b('banco-de-chile', 'Netflix 3 meses gratis', 'Accede a 3 meses de Netflix sin costo con Banco de Chile.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Netflix', terms: 'Solo nuevos suscriptores. Plan estándar.' }),
    b('banco-de-chile', '6 meses Apple TV+ gratis', 'Disfruta Apple TV+ gratis durante 6 meses.', '6 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Apple TV+', terms: 'Solo cuentas Apple nuevas en Chile.' }),
    b('banco-de-chile', '15% dcto en Despegar.com', 'Descuento en paquetes de viaje en Despegar.com.', '15%', 'PERCENTAGE', 'Viajes', { merchant: 'Despegar.com', minPurchase: 100000, terms: 'Paquetes vuelo + hotel seleccionados.' }),
    b('banco-de-chile', '20% dcto en SmartFit', 'Membresía SmartFit con 20% de descuento con Banco de Chile.', '20%', 'PERCENTAGE', 'Deporte', { merchant: 'SmartFit', terms: 'Planes mensuales y anuales.' }),
    b('banco-de-chile', '30% dcto en Óptica Lafam', 'Descuento en lentes y exámenes visuales en Óptica Lafam.', '30%', 'PERCENTAGE', 'Salud', { merchant: 'Óptica Lafam', terms: 'Marcos, lentes y exámenes visuales seleccionados.' }),

    // ═══════════════════════════════════════════════════════════
    // Itaú — 13 benefits
    // ═══════════════════════════════════════════════════════════
    b('itau', '30% dcto en restaurantes (Vie y Sáb)', 'Hasta 30% en restaurantes adheridos Itaú los viernes y sábados.', '30%', 'PERCENTAGE', 'Restaurante', { validDays: [5, 6], maxDiscount: 15000, terms: 'Más de 100 restaurantes adheridos. Reserva recomendada.' }),
    b('itau', '20% dcto en Rappi', 'Descuento en todos tus pedidos de Rappi con tarjeta Itaú.', '20%', 'PERCENTAGE', 'Restaurante', { merchant: 'Rappi', minPurchase: 5000, maxDiscount: 3000, terms: 'Máximo $3.000 dcto. Hasta 3 usos por semana.' }),
    b('itau', '20% dcto en Starbucks', 'Descuento en bebidas y alimentos Starbucks con Itaú.', '20%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', terms: 'No aplica en mercancía.' }),
    b('itau', '15% dcto en Juan Valdez', 'Ahorra en café con Juan Valdez pagando con Itaú.', '15%', 'PERCENTAGE', 'Café', { merchant: 'Juan Valdez', terms: 'Válido en bebidas y alimentos.' }),
    b('itau', '2x1 en Cinépolis los Miércoles', 'Entrada 2x1 en Cinépolis todos los miércoles con Itaú.', '2x1', 'FREEBIE', 'Cine', { merchant: 'Cinépolis', validDays: [3], terms: 'Solo funciones 2D. No aplica estrenos.' }),
    b('itau', '25% dcto en Cruz Verde', 'Descuento en Cruz Verde con tarjeta Itaú.', '25%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos receta.' }),
    b('itau', '20% dcto en Farmacias Ahumada', 'Ahorra en Farmacias Ahumada con Itaú.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'Farmacias Ahumada', terms: 'Productos de venta libre.' }),
    b('itau', '15% dcto en Adidas', 'Descuento en tiendas Adidas oficiales pagando con Itaú.', '15%', 'PERCENTAGE', 'Deporte', { merchant: 'Adidas', terms: 'Ropa, calzado y accesorios Adidas.' }),
    b('itau', '6 meses Spotify gratis', 'Disfruta Spotify Premium durante 6 meses sin costo.', '6 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores.' }),
    b('itau', '1 año gratis Paramount+', 'Acceso a Paramount+ sin costo por 12 meses con Itaú.', '1 año gratis', 'FREEBIE', 'Streaming', { merchant: 'Paramount+', terms: 'Solo para nuevas cuentas.' }),
    b('itau', '10% dcto en LATAM Travel', 'Descuento en pasajes LATAM pagando con tarjeta Itaú.', '10%', 'PERCENTAGE', 'Viajes', { merchant: 'LATAM', terms: 'Válido en latamairlines.com.' }),
    b('itau', '25% dcto en Despegar.com', 'Ahorra en paquetes de viaje en Despegar.com.', '25%', 'PERCENTAGE', 'Viajes', { merchant: 'Despegar.com', minPurchase: 200000, terms: 'Paquetes vuelo+hotel. Mínimo $200.000.' }),
    b('itau', '$10.000 bono Apple Store', 'Bono de $10.000 en compras en Apple Store Chile.', '$10.000', 'AMOUNT', 'Tecnología', { merchant: 'Apple', minPurchase: 100000, terms: 'Solo tienda física Apple. Mínimo $100.000.' }),

    // ═══════════════════════════════════════════════════════════
    // Scotiabank — 13 benefits
    // ═══════════════════════════════════════════════════════════
    b('scotiabank', '20% dcto en restaurantes (Vie-Sáb)', 'Descuento en restaurantes adheridos Scotiabank los viernes y sábados.', '20%', 'PERCENTAGE', 'Restaurante', { validDays: [5, 6], terms: 'Solo cenas en restaurantes seleccionados.' }),
    b('scotiabank', '20% dcto en Cinemark', 'Descuento en entradas Cinemark con Scotiabank.', '20%', 'PERCENTAGE', 'Cine', { merchant: 'Cinemark', terms: 'Válido todos los días. Excluye 3D premium.' }),
    b('scotiabank', '2x1 en Cine Hoyts (Mar-Jue)', 'Entrada 2x1 en Hoyts de martes a jueves con Scotiabank.', '2x1', 'FREEBIE', 'Cine', { merchant: 'Hoyts', validDays: [2, 3, 4], terms: 'Solo funciones 2D.' }),
    b('scotiabank', '15% dcto en Starbucks', 'Ahorra en tu café favorito de Starbucks con Scotiabank.', '15%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', terms: 'Bebidas y alimentos seleccionados.' }),
    b('scotiabank', '20% dcto en Café Tavelli', 'Descuento en pizzas, pastas y café en Tavelli con Scotiabank.', '20%', 'PERCENTAGE', 'Café', { merchant: 'Café Tavelli', terms: 'Válido en consumo en local.' }),
    b('scotiabank', '15% dcto en Cruz Verde', 'Descuento en Cruz Verde con tarjeta Scotiabank.', '15%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('scotiabank', '10% dcto en SalcoBrand', 'Ahorra en SalcoBrand con Scotiabank.', '10%', 'PERCENTAGE', 'Salud', { merchant: 'SalcoBrand', terms: 'Productos de venta libre.' }),
    b('scotiabank', '15% dcto en Nike', 'Descuento en ropa y calzado Nike con Scotiabank.', '15%', 'PERCENTAGE', 'Deporte', { merchant: 'Nike', terms: 'Tiendas oficiales Nike y nike.com.cl.' }),
    b('scotiabank', '25% dcto en SmartFit', 'Membresía SmartFit con 25% de descuento.', '25%', 'PERCENTAGE', 'Deporte', { merchant: 'SmartFit', terms: 'Planes mensuales y anuales.' }),
    b('scotiabank', '3 meses Disney+ gratis', 'Accede a Disney+ sin costo por 3 meses con Scotiabank.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Disney+', terms: 'Solo nuevas suscripciones.' }),
    b('scotiabank', '5% cashback en Tottus', 'Cashback en compras de supermercado Tottus.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Tottus', terms: 'Mínimo $15.000. Se acredita en 30 días.' }),
    b('scotiabank', '5% cashback en Jumbo', 'Cashback en compras en supermercados Jumbo.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Jumbo', terms: 'Se acredita en cuenta en 30 días.' }),
    b('scotiabank', '10% dcto en Despegar.com', 'Descuento en viajes y paquetes en Despegar.com.', '10%', 'PERCENTAGE', 'Viajes', { merchant: 'Despegar.com', minPurchase: 80000, terms: 'Paquetes seleccionados.' }),

    // ═══════════════════════════════════════════════════════════
    // Banco Security — 10 benefits
    // ═══════════════════════════════════════════════════════════
    b('banco-security', '40% dcto en restaurantes adheridos', 'Hasta 40% en más de 200 restaurantes a nivel nacional con Security.', '40%', 'PERCENTAGE', 'Restaurante', { minPurchase: 20000, terms: 'Restaurantes adheridos. Mínimo $20.000.' }),
    b('banco-security', '30% dcto en Starbucks', 'Descuento premium en Starbucks para clientes Security.', '30%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', terms: 'Bebidas y alimentos. No aplica merchandising.' }),
    b('banco-security', '2x1 en Hoyts Premium', 'Entrada 2x1 en la sala premium de Cine Hoyts.', '2x1', 'FREEBIE', 'Cine', { merchant: 'Hoyts', terms: 'Sala premium. Sujeto a disponibilidad.' }),
    b('banco-security', '30% dcto en Cruz Verde', 'Descuento exclusivo en Cruz Verde para clientes Security.', '30%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos controlados.' }),
    b('banco-security', '20% dcto en Clínica Alemana', 'Descuento en consultas y procedimientos ambulatorios.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'Clínica Alemana', terms: 'Prestaciones ambulatorias seleccionadas.' }),
    b('banco-security', '20% dcto en Zara y H&M', 'Descuento en tiendas Zara y H&M con Security.', '20%', 'PERCENTAGE', 'Moda', { merchant: 'Zara', terms: 'Tiendas físicas en Chile.' }),
    b('banco-security', 'Acceso VIP sala aeropuerto', 'Acceso gratuito a salas VIP en aeropuertos nacionales.', 'Gratis', 'FREEBIE', 'Viajes', { terms: 'Tarjetas Black y Platinum. 4 accesos por año.' }),
    b('banco-security', '15% dcto en hoteles 5 estrellas', 'Descuento en hoteles de lujo con Banco Security.', '15%', 'PERCENTAGE', 'Viajes', { minPurchase: 200000, terms: 'Hoteles 5 estrellas seleccionados. Mínimo $200.000.' }),
    b('banco-security', '6 meses Netflix gratis', 'Disfruta Netflix Premium durante 6 meses sin costo.', '6 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Netflix', maxDiscount: 30000, terms: 'Solo nuevos suscriptores.' }),
    b('banco-security', '25% dcto en SportLife', 'Membresía SportLife con descuento exclusivo Security.', '25%', 'PERCENTAGE', 'Deporte', { merchant: 'SportLife', terms: 'Planes mensual y anual.' }),

    // ═══════════════════════════════════════════════════════════
    // Banco Falabella — 13 benefits
    // ═══════════════════════════════════════════════════════════
    b('banco-falabella', '10% dcto en Falabella Moda', 'Descuento permanente en ropa, calzado y accesorios Falabella.', '10%', 'PERCENTAGE', 'Moda', { merchant: 'Falabella', terms: 'No aplica tecnología ni electrodomésticos.' }),
    b('banco-falabella', '15% dcto los Martes en Falabella', 'Cada martes descuento adicional en toda la tienda Falabella.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'Falabella', validDays: [2], terms: 'Solo días martes. Aplica sobre precio rebajado.' }),
    b('banco-falabella', '5% dcto en Tottus', 'Descuento en compras de supermercado Tottus con Banco Falabella.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Tottus', terms: 'Todos los días. Sin monto mínimo.' }),
    b('banco-falabella', '20% dcto en Sodimac', 'Descuento en herramientas, pinturas y jardín en Sodimac.', '20%', 'PERCENTAGE', 'Tecnología', { merchant: 'Sodimac', terms: 'Excluye liquidaciones.' }),
    b('banco-falabella', '12 cuotas sin interés en Linio', 'Compra tecnología en Linio.cl en hasta 12 cuotas sin interés.', '12 cuotas', 'SPECIAL', 'Tecnología', { merchant: 'Linio', minPurchase: 20000, terms: 'Productos seleccionados en linio.cl.' }),
    b('banco-falabella', '20% dcto en Viajes Falabella', 'Reserva con 20% de descuento en Viajes Falabella.', '20%', 'PERCENTAGE', 'Viajes', { merchant: 'Falabella Travel', terms: 'Paquetes completos vuelo + hotel.' }),
    b('banco-falabella', 'Puntos CMR dobles en combustible', 'Doble acumulación de puntos CMR al cargar combustible.', '2x puntos', 'SPECIAL', 'Combustible', { merchant: 'COPEC', terms: 'Estaciones de servicio afiliadas al programa CMR.' }),
    b('banco-falabella', '20% dcto en Café Haití', 'Descuento en el clásico Café Haití de Santiago.', '20%', 'PERCENTAGE', 'Café', { merchant: 'Café Haití', terms: 'Válido en bebidas y alimentos de lunes a viernes.' }),
    b('banco-falabella', '15% dcto en Burger King', 'Descuento en Burger King con Banco Falabella.', '15%', 'PERCENTAGE', 'Restaurante', { merchant: 'Burger King', terms: 'Válido en todas las sucursales.' }),
    b('banco-falabella', '20% dcto en Cinemark', 'Descuento en entradas de Cinemark con Banco Falabella.', '20%', 'PERCENTAGE', 'Cine', { merchant: 'Cinemark', terms: 'Funciones 2D todos los días.' }),
    b('banco-falabella', '15% dcto en Cruz Verde', 'Descuento en Cruz Verde pagando con Banco Falabella.', '15%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('banco-falabella', '15% dcto en Adidas', 'Descuento en tiendas Adidas con Banco Falabella.', '15%', 'PERCENTAGE', 'Deporte', { merchant: 'Adidas', terms: 'Ropa, calzado y accesorios Adidas.' }),
    b('banco-falabella', '50% dcto Disney+ primer mes', 'Mitad de precio en tu primer mes de Disney+ con Banco Falabella.', '50%', 'PERCENTAGE', 'Streaming', { merchant: 'Disney+', maxDiscount: 6000, terms: 'Solo nuevas suscripciones.' }),

    // ═══════════════════════════════════════════════════════════
    // BancoEstado — 13 benefits
    // ═══════════════════════════════════════════════════════════
    b('banco-estado', '3 cuotas sin interés en todo comercio', 'Con Cuenta RUT paga en 3 cuotas sin interés en comercios adheridos.', '3 cuotas', 'SPECIAL', 'Moda', { terms: 'Compras mayores a $10.000. Comercios adheridos.' }),
    b('banco-estado', '10% dcto en Lider Online', 'Descuento en compras online en Lider.cl con BancoEstado.', '10%', 'PERCENTAGE', 'Supermercado', { merchant: 'Lider', minPurchase: 20000, terms: 'Solo en lider.cl. Mínimo $20.000.' }),
    b('banco-estado', '5% cashback en Tottus', 'Cashback en compras de supermercado Tottus.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Tottus', terms: 'Se acredita en cuenta en 30 días.' }),
    b('banco-estado', '10% dcto en Cruz Verde', 'Descuento en Cruz Verde con BancoEstado.', '10%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos controlados.' }),
    b('banco-estado', '20% dcto en Salcobrand', 'Descuento en salud y belleza en SalcoBrand con BancoEstado.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'SalcoBrand', terms: 'No aplica medicamentos con receta.' }),
    b('banco-estado', '15% dcto en Cinemark CineHoy', 'Descuento en entradas Cinemark para clientes BancoEstado.', '15%', 'PERCENTAGE', 'Cine', { merchant: 'Cinemark', terms: 'Válido todos los días. Excluye 3D premium.' }),
    b('banco-estado', '10% dcto en Rappi', 'Descuento en pedidos de Rappi con BancoEstado.', '10%', 'PERCENTAGE', 'Restaurante', { merchant: 'Rappi', minPurchase: 8000, terms: 'Mínimo $8.000. Hasta 3 usos por semana.' }),
    b('banco-estado', '15% dcto en Uber Eats primer pedido', 'Descuento en tu primer pedido de Uber Eats con BancoEstado.', '15%', 'PERCENTAGE', 'Restaurante', { merchant: 'Uber Eats', minPurchase: 8000, terms: 'Solo primera compra. Mínimo $8.000.' }),
    b('banco-estado', '3 meses Spotify gratis', 'Disfruta Spotify Premium sin costo por 3 meses.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores.' }),
    b('banco-estado', '5% dcto en combustible COPEC', 'Descuento al cargar combustible en estaciones COPEC.', '5%', 'PERCENTAGE', 'Combustible', { merchant: 'COPEC', terms: 'Estaciones COPEC seleccionadas.' }),
    b('banco-estado', '10% dcto en Sodimac', 'Descuento en Sodimac con BancoEstado.', '10%', 'PERCENTAGE', 'Tecnología', { merchant: 'Sodimac', terms: 'Excluye liquidaciones.' }),
    b('banco-estado', '10% dcto en Zara Chile', 'Ahorra en Zara pagando con BancoEstado.', '10%', 'PERCENTAGE', 'Moda', { merchant: 'Zara', terms: 'Tiendas físicas Zara en Chile.' }),
    b('banco-estado', 'Seguro de vida gratuito', 'Seguro de vida básico para cuentacorrentistas BancoEstado.', 'Gratis', 'FREEBIE', 'Seguros', { terms: 'Cobertura UF 50. Solo para cuentas corrientes activas.' }),

    // ═══════════════════════════════════════════════════════════
    // Entel — 16 benefits
    // ═══════════════════════════════════════════════════════════
    b('entel', '2x1 en Cinemark los Miércoles', 'Entrada 2x1 en Cinemark todos los miércoles con Club Entel.', '2x1', 'FREEBIE', 'Cine', { merchant: 'Cinemark', validDays: [3], terms: 'Funciones 2D. No aplica estrenos estreno.' }),
    b('entel', '20% dcto en Cinépolis', 'Descuento en entradas Cinépolis para clientes Entel.', '20%', 'PERCENTAGE', 'Cine', { merchant: 'Cinépolis', terms: 'Válido en funciones 2D cualquier día.' }),
    b('entel', '30% dcto en restaurantes Club Entel', 'Descuento en más de 200 restaurantes adheridos al Club Entel.', '30%', 'PERCENTAGE', 'Restaurante', { terms: 'Presenta QR desde app Mi Entel.' }),
    b('entel', '20% dcto en Starbucks', 'Descuento en Starbucks para clientes Entel.', '20%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', terms: 'Bebidas y alimentos. Presenta app Entel.' }),
    b('entel', '15% dcto en Juan Valdez', 'Ahorra en Juan Valdez con tu plan Entel.', '15%', 'PERCENTAGE', 'Café', { merchant: 'Juan Valdez', terms: 'Bebidas y alimentos.' }),
    b('entel', '15% dcto en Cruz Verde', 'Descuento en Cruz Verde para clientes Entel.', '15%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('entel', '15% dcto en SalcoBrand', 'Ahorra en SalcoBrand con tu plan Entel.', '15%', 'PERCENTAGE', 'Salud', { merchant: 'SalcoBrand', terms: 'Productos de venta libre.' }),
    b('entel', '3 meses Spotify gratis', 'Spotify Premium por 3 meses sin costo para clientes Entel.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores.' }),
    b('entel', 'Disney+ incluido 6 meses', 'Disney+ sin costo adicional durante 6 meses con planes Entel.', '6 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Disney+', terms: 'Planes Entel desde $14.990/mes.' }),
    b('entel', 'Paramount+ incluido', 'Acceso a Paramount+ sin costo en planes seleccionados Entel.', 'Incluido', 'FREEBIE', 'Streaming', { merchant: 'Paramount+', terms: 'Planes Entel desde $19.990/mes.' }),
    b('entel', '6 meses Amazon Music gratis', 'Amazon Music Unlimited gratis por 6 meses.', '6 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Amazon Music', terms: 'Solo nuevas cuentas Amazon Music.' }),
    b('entel', '15% dcto en Despegar.com', 'Descuento en paquetes de viaje en Despegar.com.', '15%', 'PERCENTAGE', 'Viajes', { merchant: 'Despegar.com', minPurchase: 80000, terms: 'Paquetes vuelo + hotel seleccionados.' }),
    b('entel', '$3.000 dcto en Uber por viaje', 'Descuento de $3.000 en cada viaje en Uber.', '$3.000', 'AMOUNT', 'Viajes', { merchant: 'Uber', minPurchase: 4000, terms: 'Mínimo $4.000 por viaje. Máximo 2 usos por semana.' }),
    b('entel', '30% dcto en Puntoticket', 'Descuento en entradas para conciertos y eventos en Puntoticket.', '30%', 'PERCENTAGE', 'Eventos', { merchant: 'Puntoticket', terms: 'Sujeto a disponibilidad de eventos participantes.' }),
    b('entel', '20% dcto en entradas Ticketmaster', 'Ahorra en entradas para eventos en Ticketmaster.', '20%', 'PERCENTAGE', 'Eventos', { merchant: 'Ticketmaster', terms: 'Eventos seleccionados.' }),
    b('entel', '20% dcto en Marathon Sport', 'Descuento en ropa y equipamiento deportivo en Marathon.', '20%', 'PERCENTAGE', 'Deporte', { merchant: 'Marathon Sport', terms: 'Tiendas físicas Marathon Sport.' }),

    // ═══════════════════════════════════════════════════════════
    // Movistar — 13 benefits
    // ═══════════════════════════════════════════════════════════
    b('movistar', 'Movistar Play incluido', 'Acceso a Movistar Play con películas y series incluido en tu plan.', 'Incluido', 'FREEBIE', 'Streaming', { merchant: 'Movistar Play', terms: 'Planes Movistar desde $12.990/mes.' }),
    b('movistar', '30% dcto en Cinemark Club Movistar', 'Descuento en Cinemark para clientes Movistar.', '30%', 'PERCENTAGE', 'Cine', { merchant: 'Cinemark', terms: 'Presente QR en app Movistar.' }),
    b('movistar', '20% dcto en Cine Hoyts', 'Descuento en entradas de Hoyts con Movistar.', '20%', 'PERCENTAGE', 'Cine', { merchant: 'Hoyts', terms: 'Funciones regulares todos los días.' }),
    b('movistar', '3 meses Spotify gratis', 'Spotify Premium gratis por 3 meses para clientes Movistar.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores.' }),
    b('movistar', 'Apple TV+ incluido 6 meses', 'Apple TV+ sin costo durante 6 meses con tu plan Movistar.', '6 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Apple TV+', terms: 'Planes Movistar Full desde $18.990/mes.' }),
    b('movistar', '30% dcto en restaurantes', 'Descuento en restaurantes del Club Movistar Gameclub.', '30%', 'PERCENTAGE', 'Restaurante', { terms: 'Restaurantes adheridos en Santiago y regiones.' }),
    b('movistar', '20% dcto en Starbucks', 'Ahorra en Starbucks con tu plan Movistar.', '20%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', terms: 'Bebidas y alimentos.' }),
    b('movistar', '10% dcto en Juan Valdez', 'Descuento en Juan Valdez para clientes Movistar.', '10%', 'PERCENTAGE', 'Café', { merchant: 'Juan Valdez', terms: 'Bebidas calientes y frías.' }),
    b('movistar', '15% dcto en Cruz Verde', 'Descuento en Cruz Verde con plan Movistar.', '15%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('movistar', '15% dcto en Ripley', 'Descuento en moda y accesorios Ripley para clientes Movistar.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'Ripley', terms: 'Solo sección moda.' }),
    b('movistar', '25% dcto Samsung Store', 'Descuento en accesorios y wearables Samsung con Movistar.', '25%', 'PERCENTAGE', 'Tecnología', { merchant: 'Samsung', terms: 'Accesorios y wearables. No aplica a smartphones.' }),
    b('movistar', '10% dcto en SmartFit', 'Descuento en membresía SmartFit con Movistar.', '10%', 'PERCENTAGE', 'Deporte', { merchant: 'SmartFit', terms: 'Planes mensuales.' }),
    b('movistar', 'Roaming gratis en Latinoamérica', 'Usa tu plan de datos en todos los países de Latinoamérica sin costo extra.', 'Sin costo', 'FREEBIE', 'Viajes', { terms: 'Planes Full Movistar. Ver países incluidos en app.' }),

    // ═══════════════════════════════════════════════════════════
    // Claro — 13 benefits
    // ═══════════════════════════════════════════════════════════
    b('claro', 'Claro Video incluido', 'Acceso a Claro Video con películas y series sin costo adicional.', 'Incluido', 'FREEBIE', 'Streaming', { merchant: 'Claro Video', terms: 'Planes Claro desde $13.990/mes.' }),
    b('claro', 'Claro Música gratis', 'Música en streaming con Claro Música incluida en tu plan.', 'Incluido', 'FREEBIE', 'Streaming', { merchant: 'Claro Música', terms: 'Planes Claro seleccionados.' }),
    b('claro', '2x1 en Hoyts los Martes', 'Entrada 2x1 en Cine Hoyts los días martes con Claro.', '2x1', 'FREEBIE', 'Cine', { merchant: 'Hoyts', validDays: [2], terms: 'Solo funciones 2D los martes.' }),
    b('claro', '3 meses Amazon Prime gratis', 'Amazon Prime Video por 3 meses sin costo con Claro.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Amazon Prime', terms: 'Solo nuevas cuentas Amazon.' }),
    b('claro', '25% dcto en restaurantes Club Claro', 'Descuento en restaurantes adheridos al Club Claro.', '25%', 'PERCENTAGE', 'Restaurante', { terms: 'Muestra QR desde app Claro.' }),
    b('claro', '15% dcto en Starbucks', 'Ahorra en Starbucks con tu plan Claro.', '15%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', terms: 'Bebidas y alimentos.' }),
    b('claro', '20% dcto en Cruz Verde', 'Descuento en Cruz Verde para clientes Claro.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('claro', '10% dcto en SalcoBrand', 'Ahorra en SalcoBrand con tu plan Claro.', '10%', 'PERCENTAGE', 'Salud', { merchant: 'SalcoBrand', terms: 'Venta libre y cuidado personal.' }),
    b('claro', '15% dcto en Falabella Moda', 'Descuento en ropa y accesorios Falabella con Claro.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'Falabella', terms: 'Solo sección moda.' }),
    b('claro', '15% dcto en Adidas', 'Ahorra en Adidas con tu plan Claro.', '15%', 'PERCENTAGE', 'Deporte', { merchant: 'Adidas', terms: 'Tiendas oficiales Adidas.' }),
    b('claro', '10% dcto en Nike', 'Descuento en ropa y calzado Nike con Claro.', '10%', 'PERCENTAGE', 'Deporte', { merchant: 'Nike', terms: 'Tiendas Nike y nike.com.cl.' }),
    b('claro', '5% cashback en Tottus', 'Cashback en supermercados Tottus con plan Claro.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Tottus', terms: 'Se acredita en cuenta en 30 días.' }),
    b('claro', 'Redes Sociales y WhatsApp ilimitados', 'Navega en WhatsApp, Instagram y TikTok sin consumir datos.', 'Ilimitado', 'SPECIAL', 'Tecnología', { terms: 'Planes Claro desde $9.990/mes.' }),

    // ═══════════════════════════════════════════════════════════
    // WOM — 10 benefits
    // ═══════════════════════════════════════════════════════════
    b('wom', '2x1 en Cinemark cualquier día', 'Entrada 2x1 en Cinemark todos los días con WOM.', '2x1', 'FREEBIE', 'Cine', { merchant: 'Cinemark', terms: 'Funciones 2D. No aplica 3D ni estrenos de estreno.' }),
    b('wom', '20% dcto en restaurantes (Fin de Semana)', 'Descuento en restaurantes adheridos a WOM los fines de semana.', '20%', 'PERCENTAGE', 'Restaurante', { validDays: [0, 6], terms: 'Sábados y domingos. Restaurantes adheridos.' }),
    b('wom', '15% dcto en Starbucks', 'Ahorra en Starbucks con tu plan WOM.', '15%', 'PERCENTAGE', 'Café', { merchant: 'Starbucks', terms: 'Bebidas y alimentos.' }),
    b('wom', '15% dcto en Café Nero', 'Descuento en Caffè Nero con WOM.', '15%', 'PERCENTAGE', 'Café', { merchant: 'Caffè Nero', terms: 'Bebidas calientes y frías.' }),
    b('wom', '10% dcto en Cruz Verde', 'Descuento en Cruz Verde para clientes WOM.', '10%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('wom', '3 meses Spotify gratis', 'Spotify Premium por 3 meses sin costo con WOM.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores.' }),
    b('wom', '1 mes Netflix gratis', 'Primer mes de Netflix gratis al contratar plan WOM.', '1 mes gratis', 'FREEBIE', 'Streaming', { merchant: 'Netflix', maxDiscount: 8000, terms: 'Solo nuevas suscripciones. Plan estándar.' }),
    b('wom', '10% dcto en Ripley', 'Descuento en moda y accesorios Ripley con WOM.', '10%', 'PERCENTAGE', 'Moda', { merchant: 'Ripley', terms: 'Solo sección moda y calzado.' }),
    b('wom', '5% cashback en Jumbo', 'Cashback en supermercados Jumbo con plan WOM.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Jumbo', terms: 'Se acredita en cuenta en 30 días.' }),
    b('wom', '$2.000 dcto en Uber por viaje', 'Descuento de $2.000 en cada viaje Uber con WOM.', '$2.000', 'AMOUNT', 'Viajes', { merchant: 'Uber', minPurchase: 3000, terms: 'Mínimo $3.000 por viaje. Hasta 2 usos por semana.' }),

    // ═══════════════════════════════════════════════════════════
    // CMR Falabella — 13 benefits
    // ═══════════════════════════════════════════════════════════
    b('cmr-falabella', '5% dcto en Falabella siempre', 'Descuento permanente en toda la tienda Falabella con CMR.', '5%', 'PERCENTAGE', 'Moda', { merchant: 'Falabella', terms: 'Aplica en tiendas físicas y falabella.com.' }),
    b('cmr-falabella', '15% dcto los Martes en Falabella', 'Cada martes 15% adicional en toda la tienda Falabella.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'Falabella', validDays: [2], terms: 'Solo los días martes. Acumulable con 5% permanente.' }),
    b('cmr-falabella', '5% dcto en Tottus siempre', 'Descuento permanente en supermercados Tottus con CMR.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Tottus', terms: 'Sin monto mínimo. Aplica en tienda y online.' }),
    b('cmr-falabella', '15% dcto en Tottus Martes y Jueves', 'Descuento adicional en Tottus los días martes y jueves.', '15%', 'PERCENTAGE', 'Supermercado', { merchant: 'Tottus', validDays: [2, 4], minPurchase: 15000, terms: 'Martes y jueves. Mínimo $15.000.' }),
    b('cmr-falabella', '5% dcto en Sodimac', 'Descuento en Sodimac con CMR Falabella.', '5%', 'PERCENTAGE', 'Tecnología', { merchant: 'Sodimac', terms: 'Aplica en todas las secciones.' }),
    b('cmr-falabella', '20% dcto en Linio Electrónica', 'Descuento en electrónica y tecnología en Linio.cl con CMR.', '20%', 'PERCENTAGE', 'Tecnología', { merchant: 'Linio', terms: 'Productos seleccionados en linio.cl.' }),
    b('cmr-falabella', '20% dcto en Viajes Falabella', 'Descuento en paquetes turísticos con Viajes Falabella.', '20%', 'PERCENTAGE', 'Viajes', { merchant: 'Falabella Travel', terms: 'Paquetes vuelo + hotel.' }),
    b('cmr-falabella', 'Puntos CMR en LATAM', 'Acumula puntos CMR al comprar pasajes LATAM.', 'Puntos x2', 'SPECIAL', 'Viajes', { merchant: 'LATAM', terms: 'Compra a través de Viajes Falabella.' }),
    b('cmr-falabella', 'Puntos CMR dobles en COPEC', 'Doble acumulación de puntos CMR al cargar en COPEC.', 'x2 puntos', 'SPECIAL', 'Combustible', { merchant: 'COPEC', terms: 'Estaciones COPEC adheridas.' }),
    b('cmr-falabella', '20% dcto en Cinemark con puntos', 'Canjea puntos CMR o paga con CMR en Cinemark.', '20%', 'PERCENTAGE', 'Cine', { merchant: 'Cinemark', terms: 'Funciones 2D. Válido con puntos o tarjeta CMR.' }),
    b('cmr-falabella', '10% dcto en Farmacias Ahumada', 'Descuento en Farmacias Ahumada con CMR Falabella.', '10%', 'PERCENTAGE', 'Salud', { merchant: 'Farmacias Ahumada', terms: 'No aplica medicamentos con receta.' }),
    b('cmr-falabella', '15% dcto en Nike en Falabella', 'Descuento en productos Nike dentro de Falabella.', '15%', 'PERCENTAGE', 'Deporte', { merchant: 'Nike', minPurchase: 30000, terms: 'Sección deportes en Falabella. Mínimo $30.000.' }),
    b('cmr-falabella', '15% dcto en Burger King', 'Ahorra en Burger King con tu CMR Falabella.', '15%', 'PERCENTAGE', 'Restaurante', { merchant: 'Burger King', terms: 'Todas las sucursales.' }),

    // ═══════════════════════════════════════════════════════════
    // Ripley Card — 13 benefits
    // ═══════════════════════════════════════════════════════════
    b('ripley-card', '20% dcto en Ripley Moda', 'Descuento permanente en ropa y accesorios en tiendas Ripley.', '20%', 'PERCENTAGE', 'Moda', { merchant: 'Ripley', terms: 'No aplica electrónica. No acumulable.' }),
    b('ripley-card', '40% dcto en restaurantes Restofans (Lun-Jue)', 'Hasta 40% en restaurantes adheridos a Banco Ripley de lunes a jueves.', '40%', 'PERCENTAGE', 'Restaurante', { validDays: [1, 2, 3, 4], maxDiscount: 20000, terms: 'Lunes a jueves. Restaurantes Restofans adheridos.' }),
    b('ripley-card', '20% dcto en Cinépolis', 'Descuento en entradas Cinépolis con Ripley Card.', '20%', 'PERCENTAGE', 'Cine', { merchant: 'Cinépolis', terms: 'Funciones 2D todos los días.' }),
    b('ripley-card', '15% dcto en Cinemark (Lun-Mié)', 'Ahorra en Cinemark de lunes a miércoles con Ripley Card.', '15%', 'PERCENTAGE', 'Cine', { merchant: 'Cinemark', validDays: [1, 2, 3], terms: 'Lunes a miércoles. Funciones 2D.' }),
    b('ripley-card', '15% dcto en Cruz Verde', 'Descuento en Cruz Verde con Ripley Card.', '15%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('ripley-card', '10% dcto en SalcoBrand', 'Ahorra en SalcoBrand con Ripley Card.', '10%', 'PERCENTAGE', 'Salud', { merchant: 'SalcoBrand', terms: 'Venta libre y cuidado personal.' }),
    b('ripley-card', 'Puntos Ripley GO x2 en Ripley.com', 'Doble acumulación de puntos en compras online en Ripley.com.', 'x2 puntos', 'SPECIAL', 'Moda', { merchant: 'Ripley.com', terms: 'Solo compras en ripley.com.' }),
    b('ripley-card', '3 meses Spotify gratis', 'Spotify Premium por 3 meses sin costo con Ripley Card.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores.' }),
    b('ripley-card', '20% dcto en Adidas en Ripley', 'Ahorra en Adidas dentro de tiendas Ripley.', '20%', 'PERCENTAGE', 'Deporte', { merchant: 'Adidas', terms: 'Solo sección deportes en Ripley.' }),
    b('ripley-card', '10% dcto en Samsung en Ripley', 'Descuento en Samsung dentro de tiendas Ripley.', '10%', 'PERCENTAGE', 'Tecnología', { merchant: 'Samsung', minPurchase: 50000, terms: 'Mínimo $50.000.' }),
    b('ripley-card', '15% dcto en Despegar.com', 'Descuento en paquetes de viaje en Despegar.com.', '15%', 'PERCENTAGE', 'Viajes', { merchant: 'Despegar.com', minPurchase: 80000, terms: 'Paquetes seleccionados.' }),
    b('ripley-card', '$5.000 dcto primer pedido Uber Eats', 'Bono de $5.000 en tu primer pedido de Uber Eats con Ripley Card.', '$5.000', 'AMOUNT', 'Restaurante', { merchant: 'Uber Eats', minPurchase: 10000, terms: 'Solo primera compra. Mínimo $10.000.' }),
    b('ripley-card', 'Seguro de viaje gratis', 'Seguro de viaje automático al comprar pasajes con Ripley Card.', 'Gratis', 'FREEBIE', 'Seguros', { terms: 'Cobertura hasta USD 50.000 por viaje.' }),

    // ═══════════════════════════════════════════════════════════
    // La Polar Card — 10 benefits
    // ═══════════════════════════════════════════════════════════
    b('la-polar-card', '5% dcto en La Polar siempre', 'Descuento permanente en toda la tienda La Polar.', '5%', 'PERCENTAGE', 'Moda', { merchant: 'La Polar', terms: 'No aplica en liquidación.' }),
    b('la-polar-card', '15% dcto los Martes y Miércoles', 'Descuento extra en La Polar los días martes y miércoles.', '15%', 'PERCENTAGE', 'Moda', { merchant: 'La Polar', validDays: [2, 3], terms: 'Martes y miércoles. Acumulable con 5% permanente.' }),
    b('la-polar-card', '20% dcto en calzado La Polar', 'Descuento en toda la sección calzado de La Polar.', '20%', 'PERCENTAGE', 'Moda', { merchant: 'La Polar', terms: 'Excluye marcas importadas seleccionadas.' }),
    b('la-polar-card', '24 cuotas sin interés', 'Compra en La Polar en hasta 24 cuotas sin interés.', '24 cuotas', 'SPECIAL', 'Moda', { merchant: 'La Polar', minPurchase: 30000, terms: 'Compras mayores a $30.000.' }),
    b('la-polar-card', 'Puntos Club La Polar', 'Acumula puntos en todas tus compras y canjéalos por descuentos.', 'Puntos', 'SPECIAL', 'Moda', { merchant: 'La Polar', terms: 'Canjea puntos por descuentos en La Polar.' }),
    b('la-polar-card', '20% dcto en Burger King', 'Descuento en Burger King con La Polar Card.', '20%', 'PERCENTAGE', 'Restaurante', { merchant: 'Burger King', terms: 'Todas las sucursales.' }),
    b('la-polar-card', '10% dcto en Cruz Verde', 'Ahorra en Cruz Verde con La Polar Card.', '10%', 'PERCENTAGE', 'Salud', { merchant: 'Cruz Verde', terms: 'No aplica medicamentos con receta.' }),
    b('la-polar-card', '10% dcto en Cinemark', 'Descuento en entradas Cinemark con La Polar Card.', '10%', 'PERCENTAGE', 'Cine', { merchant: 'Cinemark', terms: 'Funciones 2D todos los días.' }),
    b('la-polar-card', '3 meses Spotify gratis', 'Spotify Premium por 3 meses sin costo con La Polar Card.', '3 meses gratis', 'FREEBIE', 'Streaming', { merchant: 'Spotify', terms: 'Solo nuevos suscriptores.' }),
    b('la-polar-card', '5% cashback en Unimarc', 'Cashback al comprar en supermercados Unimarc.', '5%', 'PERCENTAGE', 'Supermercado', { merchant: 'Unimarc', terms: 'Se acredita en cuenta en 30 días.' }),

    // ═══════════════════════════════════════════════════════════
    // MetLife — 10 benefits
    // ═══════════════════════════════════════════════════════════
    b('metlife', '40% dcto en atención dental', 'Descuento en atención odontológica en clínicas afiliadas MetLife.', '40%', 'PERCENTAGE', 'Salud', { terms: 'Red de 300+ dentistas. Presenta tu póliza.' }),
    b('metlife', 'Telemedicina ilimitada gratis', 'Consultas médicas online 24/7 incluidas en tu seguro MetLife.', 'Gratis', 'FREEBIE', 'Salud', { terms: 'Disponible 24/7. Titular y cargas familiares.' }),
    b('metlife', '20% dcto en ópticas', 'Descuento en lentes y marcos en ópticas afiliadas MetLife.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'Óptica Alain Afflelou', terms: 'Ópticas Alain Afflelou y participantes.' }),
    b('metlife', '30% dcto en laboratorios clínicos', 'Descuento en exámenes de laboratorio en red MetLife.', '30%', 'PERCENTAGE', 'Salud', { terms: 'Red de laboratorios partner MetLife.' }),
    b('metlife', '15% dcto en Farmacias Ahumada', 'Descuento en Farmacias Ahumada con seguro MetLife activo.', '15%', 'PERCENTAGE', 'Salud', { merchant: 'Farmacias Ahumada', terms: 'Productos de venta libre y cuidado personal.' }),
    b('metlife', '20% dcto en SalcoBrand', 'Ahorra en SalcoBrand con tu seguro MetLife.', '20%', 'PERCENTAGE', 'Salud', { merchant: 'SalcoBrand', terms: 'Medicamentos de venta libre y dermocosméticos.' }),
    b('metlife', 'Seguro de viaje incluido', 'Cobertura de seguro de viaje automática al comprar pasajes.', 'Incluido', 'FREEBIE', 'Seguros', { terms: 'Cobertura médica hasta USD 100.000 por viaje.' }),
    b('metlife', 'Cobertura dental gratis', 'Checkup dental anual sin costo adicional para asegurados.', 'Gratis', 'FREEBIE', 'Salud', { terms: 'Un checkup anual. Titular del seguro.' }),
    b('metlife', '20% dcto en SmartFit', 'Descuento en membresía SmartFit para asegurados MetLife.', '20%', 'PERCENTAGE', 'Deporte', { merchant: 'SmartFit', terms: 'Planes mensuales y anuales. Presenta póliza.' }),
    b('metlife', '15% dcto en Clínicas afiliadas', 'Descuento en consultas médicas en clínicas de la red MetLife.', '15%', 'PERCENTAGE', 'Salud', { terms: 'Red de más de 500 clínicas en todo Chile.' }),
  ];

  for (const benefit of benefits) {
    await prisma.benefit.create({ data: benefit });
  }

  // ── Demo user ─────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('demo1234', 10);
  await prisma.user.upsert({
    where: { email: 'demo@perksly.app' },
    update: {},
    create: {
      email: 'demo@perksly.app',
      password: hashedPassword,
      name: 'Usuario Demo',
    },
  });

  console.log('✅ Seeding completed!');
  console.log(`   Providers: ${providerDefs.length}`);
  console.log(`   Benefits:  ${benefits.length}`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
