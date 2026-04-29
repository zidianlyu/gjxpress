import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Button, Space, Typography } from 'antd'
import {
  DashboardOutlined,
  ShoppingOutlined,
  InboxOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useAuth } from '../contexts/AuthContext'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/orders',
      icon: <ShoppingOutlined />,
      label: '订单管理',
    },
    {
      key: '/inbound',
      icon: <InboxOutlined />,
      label: '包裹入库',
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <Layout>
      <Sider theme="light" width={200}>
        <div style={{ padding: 16, textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            GJXpress
          </Title>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Admin
          </Typography.Text>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>
            {menuItems.find(item => item.key === location.pathname)?.label || '管理后台'}
          </Title>
          <Button icon={<LogoutOutlined />} onClick={handleLogout}>
            退出
          </Button>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default MainLayout
