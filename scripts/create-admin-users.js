const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUsers() {
  try {
    console.log('🔐 Creating admin users with hashed passwords...')

    const adminUsers = [
      {
        email: 'admin@workitout.co.nz',
        password: 'admin123',
        firstName: 'Super',
        lastName: 'Admin',
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        department: 'Management',
        jobTitle: 'System Administrator'
      },
      {
        email: 'manager@workitout.co.nz', 
        password: 'manager123',
        firstName: 'Admin',
        lastName: 'Manager',
        name: 'Admin Manager',
        role: 'ADMIN',
        department: 'Operations',
        jobTitle: 'Operations Manager'
      },
      {
        email: 'viewer@workitout.co.nz',
        password: 'viewer123', 
        firstName: 'View',
        lastName: 'User',
        name: 'View User',
        role: 'VIEWER',
        department: 'Support',
        jobTitle: 'Support Specialist'
      }
    ]

    for (const userData of adminUsers) {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })

      if (existingUser) {
        console.log(`✅ User ${userData.email} already exists, updating password...`)
        
        // Hash password and update user
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        
        await prisma.user.update({
          where: { email: userData.email },
          data: {
            password: hashedPassword,
            name: userData.name,
            role: userData.role,
            lastActiveAt: new Date()
          }
        })
      } else {
        console.log(`🆕 Creating new user: ${userData.email}`)
        
        // Hash password and create user
        const hashedPassword = await bcrypt.hash(userData.password, 12)
        
        await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            name: userData.name,
            role: userData.role,
            department: userData.department,
            jobTitle: userData.jobTitle,
            isActive: true,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      }
    }

    // Create default permissions for admin users
    console.log('🔑 Setting up default permissions...')
    
    const permissions = [
      'DASHBOARD_VIEW', 'USERS_VIEW', 'USERS_EDIT', 'USERS_DELETE',
      'LEADS_VIEW', 'LEADS_EDIT', 'LEADS_DELETE', 'LEADS_EXPORT',
      'ANALYTICS_VIEW', 'CAMPAIGNS_VIEW', 'CAMPAIGNS_EDIT',
      'INTEGRATIONS_VIEW', 'INTEGRATIONS_EDIT', 'SYSTEM_SETTINGS'
    ]

    // Give super admin all permissions
    const superAdmin = await prisma.user.findUnique({
      where: { email: 'admin@workitout.co.nz' }
    })

    if (superAdmin) {
      for (const permission of permissions) {
        await prisma.userPermission.upsert({
          where: {
            userId_permission: {
              userId: superAdmin.id,
              permission: permission
            }
          },
          update: {},
          create: {
            userId: superAdmin.id,
            permission: permission,
            canRead: true,
            canWrite: true,
            canDelete: permission.includes('DELETE'),
            grantedAt: new Date()
          }
        })
      }
    }

    console.log('✅ Admin users created successfully!')
    console.log('\n📋 Login Credentials:')
    console.log('Super Admin: admin@workitout.co.nz / admin123')
    console.log('Admin: manager@workitout.co.nz / manager123') 
    console.log('Viewer: viewer@workitout.co.nz / viewer123')
    console.log('\n🔗 Login URL: http://localhost:3001/admin/login')

  } catch (error) {
    console.error('❌ Error creating admin users:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUsers()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })