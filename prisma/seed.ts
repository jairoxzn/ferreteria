import { PrismaClient, Role, ProductStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // ============================================
  // USUARIOS
  // ============================================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const vendedorPassword = await bcrypt.hash('vendedor123', 10);
  const almacenPassword = await bcrypt.hash('almacen123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@ferreteria.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@ferreteria.com',
      password: adminPassword,
      role: Role.ADMIN,
      active: true,
    },
  });

  const vendedor = await prisma.user.upsert({
    where: { email: 'vendedor@ferreteria.com' },
    update: {},
    create: {
      name: 'Juan Vendedor',
      email: 'vendedor@ferreteria.com',
      password: vendedorPassword,
      role: Role.VENDEDOR,
      active: true,
    },
  });

  await prisma.user.upsert({
    where: { email: 'almacen@ferreteria.com' },
    update: {},
    create: {
      name: 'Carlos Almacén',
      email: 'almacen@ferreteria.com',
      password: almacenPassword,
      role: Role.ALMACEN,
      active: true,
    },
  });

  console.log('✅ Usuarios creados\n');

  // ============================================
  // CATEGORÍAS
  // ============================================
  const categories = [
    { name: 'Herramientas', slug: 'herramientas', icon: 'Wrench', color: '#FACC15' },
    { name: 'Pinturas', slug: 'pinturas', icon: 'Paintbrush', color: '#EF4444' },
    { name: 'Electricidad', slug: 'electricidad', icon: 'Zap', color: '#3B82F6' },
    { name: 'Construcción', slug: 'construccion', icon: 'HardHat', color: '#A16207' },
    { name: 'Gasfitería', slug: 'gasfiteria', icon: 'Droplets', color: '#0EA5E9' },
    { name: 'Tornillos y fijación', slug: 'tornillos', icon: 'Cog', color: '#6B7280' },
    { name: 'Seguridad industrial', slug: 'seguridad', icon: 'ShieldCheck', color: '#10B981' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categorías creadas\n');

  // ============================================
  // PROVEEDORES
  // ============================================
  const suppliers = [
    {
      company: 'Distribuidora Industrial SAC',
      ruc: '20123456789',
      contact: 'Luis Ramirez',
      email: 'ventas@distindustrial.pe',
      phone: '987654321',
      address: 'Av. Industrial 1234',
      city: 'Lima',
    },
    {
      company: 'Importadora Ferretera Perú',
      ruc: '20987654321',
      contact: 'Maria Lopez',
      email: 'compras@ferreteraperu.pe',
      phone: '912345678',
      address: 'Jr. Comercio 567',
      city: 'Lima',
    },
  ];

  for (const sup of suppliers) {
    await prisma.supplier.upsert({
      where: { ruc: sup.ruc },
      update: {},
      create: sup,
    });
  }

  console.log('✅ Proveedores creados\n');

  // ============================================
  // PRODUCTOS DE EJEMPLO
  // ============================================
  const herramientas = await prisma.category.findUnique({ where: { slug: 'herramientas' } });
  const electricidad = await prisma.category.findUnique({ where: { slug: 'electricidad' } });
  const tornillos = await prisma.category.findUnique({ where: { slug: 'tornillos' } });
  const proveedor1 = await prisma.supplier.findUnique({ where: { ruc: '20123456789' } });

  const products = [
    {
      name: 'Martillo Stanley 16oz',
      sku: 'HER-001',
      brand: 'Stanley',
      unit: 'UND',
      purchasePrice: 25.0,
      salePrice: 45.0,
      stock: 50,
      minStock: 10,
      categoryId: herramientas!.id,
      supplierId: proveedor1!.id,
    },
    {
      name: 'Destornillador Phillips #2',
      sku: 'HER-002',
      brand: 'Truper',
      unit: 'UND',
      purchasePrice: 8.5,
      salePrice: 15.0,
      stock: 120,
      minStock: 20,
      categoryId: herramientas!.id,
      supplierId: proveedor1!.id,
    },
    {
      name: 'Taladro Bosch 600W',
      sku: 'HER-003',
      brand: 'Bosch',
      unit: 'UND',
      purchasePrice: 280.0,
      salePrice: 420.0,
      stock: 8,
      minStock: 5,
      categoryId: herramientas!.id,
      supplierId: proveedor1!.id,
    },
    {
      name: 'Cable eléctrico THW 14 AWG',
      sku: 'ELE-001',
      brand: 'Indeco',
      unit: 'M',
      purchasePrice: 1.5,
      salePrice: 2.8,
      stock: 500,
      minStock: 100,
      categoryId: electricidad!.id,
      supplierId: proveedor1!.id,
    },
    {
      name: 'Interruptor simple Bticino',
      sku: 'ELE-002',
      brand: 'Bticino',
      unit: 'UND',
      purchasePrice: 7.0,
      salePrice: 13.5,
      stock: 3,
      minStock: 15,
      categoryId: electricidad!.id,
      supplierId: proveedor1!.id,
    },
    {
      name: 'Tornillo autorroscante 1/2"',
      sku: 'TOR-001',
      brand: 'Genérico',
      unit: 'CIENTO',
      purchasePrice: 12.0,
      salePrice: 22.0,
      stock: 80,
      minStock: 20,
      categoryId: tornillos!.id,
      supplierId: proveedor1!.id,
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        ...prod,
        status: ProductStatus.ACTIVE,
      },
    });
  }

  console.log('✅ Productos creados\n');

  // ============================================
  // CLIENTE GENÉRICO
  // ============================================
  await prisma.customer.upsert({
    where: { document: '00000000' },
    update: {},
    create: {
      name: 'Cliente Genérico',
      document: '00000000',
    },
  });

  console.log('✅ Cliente genérico creado\n');

  console.log('🎉 Seed completado exitosamente!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Credenciales de acceso:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin     → admin@ferreteria.com / admin123');
  console.log('Vendedor  → vendedor@ferreteria.com / vendedor123');
  console.log('Almacén   → almacen@ferreteria.com / almacen123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
