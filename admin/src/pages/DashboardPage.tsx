import { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, Table, Tag, Spin } from 'antd'
import {
  ShoppingOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { orderApi } from '../api/client'
import dayjs from 'dayjs'

interface Order {
  id: string
  status: string
  payment_status: string
  total_actual_weight: number | null
  final_price: number | null
  created_at: string
  packages: { id: string }[]
}

const statusMap: Record<string, { label: string; color: string }> = {
  UNINBOUND: { label: '未入库', color: 'default' },
  INBOUNDED: { label: '已入库', color: 'processing' },
  USER_CONFIRM_PENDING: { label: '待确认', color: 'warning' },
  REVIEW_PENDING: { label: '待审核', color: 'warning' },
  PAYMENT_PENDING: { label: '待支付', color: 'error' },
  PAID: { label: '已支付', color: 'success' },
  READY_TO_SHIP: { label: '待发货', color: 'processing' },
  SHIPPED: { label: '已发货', color: 'blue' },
  COMPLETED: { label: '已完成', color: 'success' },
}

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  UNPAID: { label: '未支付', color: 'error' },
  PROCESSING: { label: '处理中', color: 'warning' },
  PAID: { label: '已支付', color: 'success' },
}

const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayment: 0,
    pendingInbound: 0,
    completed: 0,
  })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data } = await orderApi.getOrders()
      setOrders(data.slice(0, 5)) // 最近5条
      
      // 计算统计
      setStats({
        totalOrders: data.length,
        pendingPayment: data.filter((o: Order) => o.payment_status === 'UNPAID').length,
        pendingInbound: data.filter((o: Order) => o.status === 'UNINBOUND').length,
        completed: data.filter((o: Order) => o.status === 'COMPLETED').length,
      })
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const { label, color } = statusMap[status] || { label: status, color: 'default' }
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '支付状态',
      dataIndex: 'payment_status',
      key: 'payment_status',
      render: (status: string) => {
        const { label, color } = paymentStatusMap[status] || { label: status, color: 'default' }
        return <Tag color={color}>{label}</Tag>
      },
    },
    {
      title: '包裹数',
      key: 'packages',
      render: (_: any, record: Order) => record.packages?.length || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
  ]

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总订单"
              value={stats.totalOrders}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待支付"
              value={stats.pendingPayment}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待入库"
              value={stats.pendingInbound}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近订单">
        <Table
          dataSource={orders}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  )
}

export default DashboardPage
