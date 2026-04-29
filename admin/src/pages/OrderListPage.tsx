import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Button, Space, Input, Card, DatePicker, message } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { orderApi } from '../api/client'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface Order {
  id: string
  status: string
  payment_status: string
  total_actual_weight: number | null
  total_volume_weight: number | null
  chargeable_weight: number | null
  estimated_price: number | null
  final_price: number | null
  currency: string
  manual_override: boolean
  created_at: string
  updated_at: string
  packages: { id: string; domestic_tracking_no: string }[]
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

const OrderListPage: React.FC = () => {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data } = await orderApi.getOrders()
      setOrders(data)
    } catch (error: any) {
      message.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchText.toLowerCase()) ||
    order.packages.some(p => p.domestic_tracking_no?.includes(searchText))
  )

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      ellipsis: true,
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
      render: (status: string, record: Order) => (
        <Space>
          <Tag color={paymentStatusMap[status]?.color || 'default'}>
            {paymentStatusMap[status]?.label || status}
          </Tag>
          {record.manual_override && <Tag size="small">人工</Tag>}
        </Space>
      ),
    },
    {
      title: '包裹数',
      key: 'packages',
      render: (_: any, record: Order) => record.packages?.length || 0,
    },
    {
      title: '计费重量 (kg)',
      key: 'weight',
      render: (_: any, record: Order) => 
        record.chargeable_weight?.toFixed(2) || '-',
    },
    {
      title: '金额',
      key: 'price',
      render: (_: any, record: Order) => {
        const price = record.final_price || record.estimated_price
        return price ? `${price} ${record.currency}` : '-'
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Order) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/orders/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索订单ID或运单号"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <RangePicker />
          <Button onClick={fetchOrders}>刷新</Button>
        </Space>
      </Card>

      <Table
        dataSource={filteredOrders}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}

export default OrderListPage
