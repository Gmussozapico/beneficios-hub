const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean benefits on re-seed
  await prisma.benefit.deleteMany({});

  // Create Categories
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

  // Create Providers
  const providers = [
    // Bancos
    {
      name: 'BCI',
      slug: 'bci',
      description: 'Banco de Crédito e Inversiones - tarjetas y beneficios exclusivos',
      logoUrl: 'https://www.google.com/s2/favicons?domain=bci.cl&sz=128',
      categoryId: bancosCategory.id,
    },
    {
      name: 'Santander',
      slug: 'santander',
      description: 'Banco Santander Chile - beneficios para tarjetahabientes',
      logoUrl: 'https://www.google.com/s2/favicons?domain=santander.cl&sz=128',
      categoryId: bancosCategory.id,
    },
    {
      name: 'Banco de Chile',
      slug: 'banco-de-chile',
      description: 'Banco de Chile - Club de Beneficios exclusivos',
      logoUrl: 'https://www.google.com/s2/favicons?domain=bancochile.cl&sz=128',
      categoryId: bancosCategory.id,
    },
    {
      name: 'Itaú',
      slug: 'itau',
      description: 'Banco Itaú Chile - descuentos y promociones',
      logoUrl: 'https://www.google.com/s2/favicons?domain=itau.cl&sz=128',
      categoryId: bancosCategory.id,
    },
    {
      name: 'Scotiabank',
      slug: 'scotiabank',
      description: 'Scotiabank Chile - beneficios para clientes',
      logoUrl: 'https://www.google.com/s2/favicons?domain=scotiabank.cl&sz=128',
      categoryId: bancosCategory.id,
    },
    {
      name: 'Banco Security',
      slug: 'banco-security',
      description: 'Banco Security - beneficios exclusivos para clientes',
      logoUrl: 'https://www.google.com/s2/favicons?domain=security.cl&sz=128',
      categoryId: bancosCategory.id,
    },
    {
      name: 'Banco Falabella',
      slug: 'banco-falabella',
      description: 'Banco Falabella - CMR Visa y beneficios en el ecosistema Falabella',
      logoUrl: 'https://www.google.com/s2/favicons?domain=bancofalabella.cl&sz=128',
      categoryId: bancosCategory.id,
    },
    {
      name: 'BancoEstado',
      slug: 'banco-estado',
      description: 'BancoEstado - beneficios para cuenta RUT y tarjetas',
      logoUrl: 'https://www.google.com/s2/favicons?domain=bancoestado.cl&sz=128',
      categoryId: bancosCategory.id,
    },
    // Telefonía
    {
      name: 'Entel',
      slug: 'entel',
      description: 'Entel - beneficios exclusivos para clientes Entel',
      logoUrl: 'https://www.google.com/s2/favicons?domain=entel.cl&sz=128',
      categoryId: telefoniaCategory.id,
    },
    {
      name: 'Movistar',
      slug: 'movistar',
      description: 'Movistar Chile - descuentos y beneficios para clientes',
      logoUrl: 'https://www.google.com/s2/favicons?domain=movistar.cl&sz=128',
      categoryId: telefoniaCategory.id,
    },
    {
      name: 'Claro',
      slug: 'claro',
      description: 'Claro Chile - Club de Beneficios para clientes',
      logoUrl: 'https://www.google.com/s2/favicons?domain=claro.cl&sz=128',
      categoryId: telefoniaCategory.id,
    },
    {
      name: 'WOM',
      slug: 'wom',
      description: 'WOM Chile - beneficios para clientes WOM',
      logoUrl: 'https://www.google.com/s2/favicons?domain=wom.cl&sz=128',
      categoryId: telefoniaCategory.id,
    },
    // Retail
    {
      name: 'CMR Falabella',
      slug: 'cmr-falabella',
      description: 'Tarjeta CMR Falabella - descuentos en Falabella y partners',
      logoUrl: 'https://www.google.com/s2/favicons?domain=falabella.com&sz=128',
      categoryId: retailCategory.id,
    },
    {
      name: 'Ripley Card',
      slug: 'ripley-card',
      description: 'Tarjeta Ripley - beneficios en tiendas Ripley y partners',
      logoUrl: 'https://www.google.com/s2/favicons?domain=ripley.cl&sz=128',
      categoryId: retailCategory.id,
    },
    {
      name: 'La Polar Card',
      slug: 'la-polar-card',
      description: 'Tarjeta La Polar - descuentos y cuotas sin interés',
      logoUrl: 'https://www.google.com/s2/favicons?domain=lapolar.cl&sz=128',
      categoryId: retailCategory.id,
    },
    // Seguros
    {
      name: 'MetLife',
      slug: 'metlife',
      description: 'MetLife Chile - seguros y beneficios de salud y bienestar',
      logoUrl: 'https://www.google.com/s2/favicons?domain=metlife.cl&sz=128',
      categoryId: segurosCategory.id,
    },
  ];

  const createdProviders = {};
  for (const provider of providers) {
    const created = await prisma.provider.upsert({
      where: { slug: provider.slug },
      update: { logoUrl: provider.logoUrl },
      create: provider,
    });
    createdProviders[provider.slug] = created;
  }

  // Create Benefits
  const benefits = [
    // BCI Benefits
    {
      title: '20% dcto en restaurantes',
      description: 'Obtén 20% de descuento en restaurantes participantes pagando con tu tarjeta BCI.',
      discount: '20%',
      type: 'PERCENTAGE',
      category: 'Gastronomía',
      providerId: createdProviders['bci'].id,
      terms: 'Válido de lunes a domingo en restaurantes participantes. Máximo $15.000 de descuento por transacción.',
      validDays: [],
    },
    {
      title: '15% dcto en farmacias Cruz Verde',
      description: 'Descuento especial en todas las sucursales Cruz Verde con tarjeta BCI.',
      discount: '15%',
      type: 'PERCENTAGE',
      category: 'Salud',
      providerId: createdProviders['bci'].id,
      terms: 'Válido en productos de venta libre. No incluye medicamentos con receta.',
      validDays: [],
    },
    {
      title: '2x1 en cines Cinemark',
      description: 'Lleva a un amigo gratis a cualquier función en Cinemark con tu tarjeta BCI.',
      discount: '2x1',
      type: 'FREEBIE',
      category: 'Entretenimiento',
      providerId: createdProviders['bci'].id,
      terms: 'Válido de lunes a jueves. Excluye estrenos y funciones especiales.',
      validDays: [1, 2, 3, 4],
    },

    // Santander Benefits
    {
      title: '25% dcto en Uber Eats',
      description: 'Obtén 25% de descuento en tus pedidos de Uber Eats pagando con Santander.',
      discount: '25%',
      type: 'PERCENTAGE',
      category: 'Gastronomía',
      providerId: createdProviders['santander'].id,
      terms: 'Mínimo de pedido $8.000. Máximo 4 usos por mes.',
      validDays: [],
    },
    {
      title: '30% dcto en hoteles booking.com',
      description: 'Reserva hoteles en booking.com con hasta 30% de descuento.',
      discount: '30%',
      type: 'PERCENTAGE',
      category: 'Viajes',
      providerId: createdProviders['santander'].id,
      terms: 'Descuento aplicable a hoteles seleccionados. Reserva con al menos 7 días de anticipación.',
      validDays: [],
    },
    {
      title: '$5.000 en compras de gasolina',
      description: 'Acumula $5.000 de descuento en COPEC al gastar $50.000 o más.',
      discount: '$5.000',
      type: 'AMOUNT',
      category: 'Combustible',
      providerId: createdProviders['santander'].id,
      terms: 'Aplica en estaciones COPEC seleccionadas. Máximo 1 vez por mes.',
      validDays: [],
    },

    // Banco de Chile Benefits
    {
      title: '10% dcto en LAN/LATAM',
      description: 'Descuento en pasajes nacionales e internacionales pagando con Banco de Chile.',
      discount: '10%',
      type: 'PERCENTAGE',
      category: 'Viajes',
      providerId: createdProviders['banco-de-chile'].id,
      terms: 'Válido en compras en latamairlines.com. No aplica a impuestos ni tasas.',
      validDays: [],
    },
    {
      title: 'Netflix 3 meses $0',
      description: 'Accede a 3 meses de Netflix gratis al pagar con tu tarjeta Banco de Chile.',
      discount: '3 meses gratis',
      type: 'FREEBIE',
      category: 'Streaming',
      providerId: createdProviders['banco-de-chile'].id,
      terms: 'Solo para nuevos suscriptores de Netflix. Aplica plan estándar.',
      validDays: [],
    },
    {
      title: '15% dcto en Falabella.com',
      description: 'Ahorra 15% en toda la tienda online de Falabella con tarjeta Banco de Chile.',
      discount: '15%',
      type: 'PERCENTAGE',
      category: 'Compras',
      providerId: createdProviders['banco-de-chile'].id,
      terms: 'Aplica en compras mínimas de $30.000. Excluye tecnología y electrodomésticos.',
      validDays: [],
    },

    // Itaú Benefits
    {
      title: '20% dcto en Rappi',
      description: 'Obtén 20% de descuento en todos tus pedidos de Rappi con tarjeta Itaú.',
      discount: '20%',
      type: 'PERCENTAGE',
      category: 'Gastronomía',
      providerId: createdProviders['itau'].id,
      terms: 'Máximo $3.000 de descuento por pedido. Hasta 3 usos por semana.',
      validDays: [],
    },
    {
      title: '$10.000 en Apple Store',
      description: 'Bono de $10.000 en compras en Apple Store Chile pagando con Itaú.',
      discount: '$10.000',
      type: 'AMOUNT',
      category: 'Tecnología',
      providerId: createdProviders['itau'].id,
      terms: 'Compra mínima de $100.000. Solo en Apple Store física en Chile.',
      validDays: [],
    },
    {
      title: '2x1 en Teatro Municipal',
      description: 'Compra una entrada y lleva a un acompañante gratis al Teatro Municipal.',
      discount: '2x1',
      type: 'FREEBIE',
      category: 'Entretenimiento',
      providerId: createdProviders['itau'].id,
      terms: 'Válido para funciones seleccionadas. Compra en taquilla o online.',
      validDays: [],
    },

    // Scotiabank Benefits
    {
      title: '25% dcto en gimnasios Smart Fit',
      description: 'Paga tu membresía Smart Fit con Scotiabank y obtén 25% de descuento.',
      discount: '25%',
      type: 'PERCENTAGE',
      category: 'Deporte',
      providerId: createdProviders['scotiabank'].id,
      terms: 'Aplica en membresías mensuales y anuales.',
      validDays: [],
    },
    {
      title: '15% dcto en viajes internacionales',
      description: 'Descuento en paquetes de viaje internacional con agencias participantes.',
      discount: '15%',
      type: 'PERCENTAGE',
      category: 'Viajes',
      providerId: createdProviders['scotiabank'].id,
      terms: 'Válido en agencias de viaje partner. Consultar disponibilidad.',
      validDays: [],
    },

    // Banco Security Benefits
    {
      title: '20% dcto en restaurantes selectos',
      description: 'Descuentos en los mejores restaurantes de Chile con tarjeta Security.',
      discount: '20%',
      type: 'PERCENTAGE',
      category: 'Gastronomía',
      providerId: createdProviders['banco-security'].id,
      terms: 'Válido en más de 200 restaurantes a nivel nacional.',
      validDays: [],
    },
    {
      title: 'Acceso VIP sala aeropuerto',
      description: 'Acceso gratuito a salas VIP en principales aeropuertos de Chile.',
      discount: 'Acceso gratuito',
      type: 'FREEBIE',
      category: 'Viajes',
      providerId: createdProviders['banco-security'].id,
      terms: 'Aplica en tarjetas de crédito Black y Platinum. 4 accesos gratuitos por año.',
      validDays: [],
    },

    // Banco Falabella Benefits
    {
      title: '10% dcto en Falabella todos los días',
      description: 'Descuento permanente del 10% en todas las tiendas Falabella.',
      discount: '10%',
      type: 'PERCENTAGE',
      category: 'Compras',
      providerId: createdProviders['banco-falabella'].id,
      terms: 'Aplica en tienda física y online. Excluye promociones ya rebajadas.',
      validDays: [],
    },
    {
      title: 'Cuotas sin interés en Linio',
      description: 'Compra en Linio.cl en hasta 12 cuotas sin interés con CMR Visa.',
      discount: '12 cuotas sin interés',
      type: 'SPECIAL',
      category: 'Compras',
      providerId: createdProviders['banco-falabella'].id,
      terms: 'Aplica en productos seleccionados de Linio. Monto mínimo $20.000.',
      validDays: [],
    },
    {
      title: '20% dcto en Viajes Falabella',
      description: 'Reserva tu viaje con Viajes Falabella y ahorra 20% pagando con CMR.',
      discount: '20%',
      type: 'PERCENTAGE',
      category: 'Viajes',
      providerId: createdProviders['banco-falabella'].id,
      terms: 'Válido en paquetes completos (vuelo + hotel).',
      validDays: [],
    },

    // BancoEstado Benefits
    {
      title: '10% dcto con Cuenta RUT',
      description: 'Descuento en comercios participantes usando tu Cuenta RUT BancoEstado.',
      discount: '10%',
      type: 'PERCENTAGE',
      category: 'Compras',
      providerId: createdProviders['banco-estado'].id,
      terms: 'Aplica en más de 500 comercios adheridos en todo Chile.',
      validDays: [],
    },
    {
      title: 'Seguro de vida gratuito',
      description: 'Seguro de vida básico gratuito para todos los clientes BancoEstado.',
      discount: 'Gratis',
      type: 'FREEBIE',
      category: 'Seguros',
      providerId: createdProviders['banco-estado'].id,
      terms: 'Aplica para clientes con cuenta corriente activa. Cobertura de UF 50.',
      validDays: [],
    },

    // Entel Benefits
    {
      title: '40% dcto en Spotify',
      description: 'Plan Spotify Premium con 40% de descuento para clientes Entel.',
      discount: '40%',
      type: 'PERCENTAGE',
      category: 'Streaming',
      providerId: createdProviders['entel'].id,
      terms: 'Descuento aplicado directamente en tu boleta Entel.',
      validDays: [],
    },
    {
      title: 'Disney+ incluido',
      description: 'Disney+ incluido sin costo adicional en planes seleccionados Entel.',
      discount: 'Incluido',
      type: 'FREEBIE',
      category: 'Streaming',
      providerId: createdProviders['entel'].id,
      terms: 'Aplica en planes Entel desde $14.990/mes.',
      validDays: [],
    },
    {
      title: '30% dcto en accesorios Entel',
      description: 'Descuento especial en accesorios y accesorios en tiendas Entel.',
      discount: '30%',
      type: 'PERCENTAGE',
      category: 'Tecnología',
      providerId: createdProviders['entel'].id,
      terms: 'Aplica en fundas, cargadores, audífonos y más.',
      validDays: [],
    },

    // Movistar Benefits
    {
      title: 'Apple TV+ incluido',
      description: 'Accede a Apple TV+ gratis con tu plan Movistar.',
      discount: 'Incluido',
      type: 'FREEBIE',
      category: 'Streaming',
      providerId: createdProviders['movistar'].id,
      terms: 'Aplica en planes Movistar desde $12.990/mes. Activa en la app.',
      validDays: [],
    },
    {
      title: '25% dcto en Samsung Store',
      description: 'Descuento especial en tiendas Samsung para clientes Movistar.',
      discount: '25%',
      type: 'PERCENTAGE',
      category: 'Tecnología',
      providerId: createdProviders['movistar'].id,
      terms: 'Válido en accesorios y wearables Samsung. Presenta tu número Movistar.',
      validDays: [],
    },
    {
      title: 'Roaming gratis en Latinoamérica',
      description: 'Usa tu plan de datos en todos los países de Latinoamérica sin costo extra.',
      discount: 'Sin costo adicional',
      type: 'FREEBIE',
      category: 'Viajes',
      providerId: createdProviders['movistar'].id,
      terms: 'Aplica en planes Full desde $18.990/mes. Consultar países participantes.',
      validDays: [],
    },

    // Claro Benefits
    {
      title: 'Max (HBO) incluido',
      description: 'Acceso a Max (HBO Max) incluido en tu plan Claro.',
      discount: 'Incluido',
      type: 'FREEBIE',
      category: 'Streaming',
      providerId: createdProviders['claro'].id,
      terms: 'Aplica en planes Claro desde $15.990/mes.',
      validDays: [],
    },
    {
      title: '20% dcto en restaurantes',
      description: 'Beneficios gastronómicos en restaurantes partner de Claro.',
      discount: '20%',
      type: 'PERCENTAGE',
      category: 'Gastronomía',
      providerId: createdProviders['claro'].id,
      terms: 'Válido en restaurantes adheridos. Mostrar QR en app Claro.',
      validDays: [],
    },

    // WOM Benefits
    {
      title: 'Datos ilimitados incluidos',
      description: 'Navega sin límite con datos ilimitados en todos los planes WOM.',
      discount: 'Ilimitado',
      type: 'FREEBIE',
      category: 'Conectividad',
      providerId: createdProviders['wom'].id,
      terms: 'Velocidades reducidas después de 30GB de uso mensual.',
      validDays: [],
    },
    {
      title: '50% dcto primer mes',
      description: 'Paga solo el 50% de tu primer mes al cambiarte a WOM.',
      discount: '50%',
      type: 'PERCENTAGE',
      category: 'Telefonía',
      providerId: createdProviders['wom'].id,
      terms: 'Solo para nuevos clientes WOM. Portabilidad numérica requerida.',
      validDays: [],
    },

    // CMR Falabella Benefits
    {
      title: '15% dcto todos los martes',
      description: 'Cada martes obtén 15% de descuento en toda la tienda Falabella.',
      discount: '15%',
      type: 'PERCENTAGE',
      category: 'Compras',
      providerId: createdProviders['cmr-falabella'].id,
      terms: 'Válido solo los días martes en tiendas físicas y online.',
      validDays: [2],
    },
    {
      title: 'Puntos CMR dobles en combustible',
      description: 'Acumula el doble de puntos CMR al cargar combustible en estaciones afiliadas.',
      discount: '2x puntos',
      type: 'SPECIAL',
      category: 'Combustible',
      providerId: createdProviders['cmr-falabella'].id,
      terms: 'Aplica en estaciones de servicio Falabella y afiliadas.',
      validDays: [],
    },

    // Ripley Card Benefits
    {
      title: '20% dcto en Ripley',
      description: 'Descuento permanente del 20% pagando con Ripley Card en tiendas Ripley.',
      discount: '20%',
      type: 'PERCENTAGE',
      category: 'Compras',
      providerId: createdProviders['ripley-card'].id,
      terms: 'No acumulable con otras promociones. Excluye electrónica.',
      validDays: [],
    },
    {
      title: 'Seguros de viaje gratis',
      description: 'Seguro de viaje automático en compras de pasajes con Ripley Card.',
      discount: 'Gratis',
      type: 'FREEBIE',
      category: 'Seguros',
      providerId: createdProviders['ripley-card'].id,
      terms: 'Cobertura hasta USD 50.000. Aplica en compras de pasajes aéreos.',
      validDays: [],
    },

    // La Polar Benefits
    {
      title: '30% dcto en ropa',
      description: 'Descuento especial del 30% en toda la línea de ropa La Polar.',
      discount: '30%',
      type: 'PERCENTAGE',
      category: 'Moda',
      providerId: createdProviders['la-polar-card'].id,
      terms: 'Válido en temporadas regulares. No aplica en liquidación.',
      validDays: [],
    },
    {
      title: '24 cuotas sin interés',
      description: 'Compra en La Polar en hasta 24 cuotas sin interés con La Polar Card.',
      discount: '24 cuotas sin interés',
      type: 'SPECIAL',
      category: 'Compras',
      providerId: createdProviders['la-polar-card'].id,
      terms: 'Aplica en compras superiores a $30.000.',
      validDays: [],
    },

    // MetLife Benefits
    {
      title: 'Descuento en dentista',
      description: 'Hasta 40% de descuento en atención dental en clínicas afiliadas MetLife.',
      discount: '40%',
      type: 'PERCENTAGE',
      category: 'Salud',
      providerId: createdProviders['metlife'].id,
      terms: 'Red de más de 300 dentistas a nivel nacional. Presenta tu póliza MetLife.',
      validDays: [],
    },
    {
      title: 'Telemedicina gratis',
      description: 'Consultas médicas online ilimitadas incluidas en tu seguro MetLife.',
      discount: 'Incluido',
      type: 'FREEBIE',
      category: 'Salud',
      providerId: createdProviders['metlife'].id,
      terms: 'Disponible 24/7. Aplica para titular y cargas familiares.',
      validDays: [],
    },
    {
      title: '20% dcto en ópticas',
      description: 'Descuento en ópticas y lentes con tu cobertura MetLife.',
      discount: '20%',
      type: 'PERCENTAGE',
      category: 'Salud',
      providerId: createdProviders['metlife'].id,
      terms: 'Válido en ópticas Alain Afflelou y participantes.',
      validDays: [],
    },
  ];

  for (const benefit of benefits) {
    await prisma.benefit.create({ data: benefit });
  }

  // Create demo user
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

  console.log('Seeding completed successfully!');
  console.log(`Created ${providers.length} providers`);
  console.log(`Created ${benefits.length} benefits`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
