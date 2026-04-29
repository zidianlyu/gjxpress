import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Input, Button, Form, Typography, message, Alert } from 'antd'
import { useAuth } from '../contexts/AuthContext'
import { authApi } from '../api/client'

const { Title } = Typography

// 模拟微信登录 - 实际项目中应该调用 wx.login
const mockWxLogin = async (): Promise<string> => {
  // 模拟获取 code
  return 'mock_wx_code_' + Date.now()
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (values: { code: string }) => {
    setLoading(true)
    try {
      // 实际应该使用微信 code
      const wxCode = await mockWxLogin()
      const { data } = await authApi.login(wxCode)
      login(data.access_token)
      message.success('登录成功')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  // 快速登录 - 用于开发测试
  const handleDevLogin = async () => {
    setLoading(true)
    try {
      // 直接使用 mock code 登录
      const { data } = await authApi.login('dev_mock_code')
      login(data.access_token)
      message.success('开发模式登录成功')
      navigate('/dashboard')
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>GJXpress Admin</Title>
          <Typography.Text type="secondary">广骏供应链管理系统</Typography.Text>
        </div>
        
        <Alert
          message="开发模式"
          description="点击下方按钮快速登录（跳过微信授权）"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Button 
          type="primary" 
          block 
          size="large"
          loading={loading}
          onClick={handleDevLogin}
        >
          开发登录
        </Button>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            或使用模拟微信登录
          </Typography.Text>
        </div>

        <Form onFinish={handleLogin} style={{ marginTop: 16 }}>
          <Form.Item name="code" rules={[{ required: true, message: '请输入授权码' }]}>
            <Input placeholder="微信授权码" />
          </Form.Item>
          <Form.Item>
            <Button type="default" block loading={loading} htmlType="submit">
              微信登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
