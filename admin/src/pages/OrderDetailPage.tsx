import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Space,
  Spin,
  message,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Divider,
  Table,
  Timeline,
} from 'antd'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  TruckOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import { orderApi, shipmentApi, adminLogApi } from '../api/client'
import dayjs from 'dayjs'

const { Option } = Select

interface Order {
  id: string
  user_id: string
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
  packages: Package[]
  shipment?: Shipment
}

interface Package {
  id: string
  domestic_tracking_no: string
  source_platform: string | null
  status: string
  actual_weight: number | null
  length: number | null
  width: number | null
  height: number | null
  volume_weight: number | null
  inbound_time: string | null
  user_confirmed_at: string | null
  images: { id: string; type: string; url: string }[]
}

interface Shipment {
  id: string
  provider: string
  tracking_number: string
  shipped_at: string | null
  estimated_arrival: string | null
  status: string
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

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  
  // Modal states
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [shipmentModalVisible, setShipmentModalVisible] = useState(false)
  
  // Forms
  const [paymentForm] = Form.useForm()
  const [shipmentForm] = Form.useForm()

  useEffect(() => {
    if (id) {
      fetchOrderDetail()
      fetchAdminLogs()
    }
  }, [id])

  const fetchOrderDetail = async () => {
    setLoading(true)
    try {
      const { data } = await orderApi.getOrder(id!)
      setOrder(data)
    } catch (error) {
      message.error('获取订单详情失败')
    } finally {
      setLoading(false)
    }
  }

  const fetchAdminLogs = async () => {
    try {
      const { data } = await adminLogApi.getLogs(id)
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    }
  }

  const handleUpdatePayment = async (values: any) => {
    try {
      await orderApi.updatePayment(
        id!,
        values.status,
        values.final_price,
        true // manual_override
      )
      message.success('支付状态更新成功')
      setPaymentModalVisible(false)
      fetchOrderDetail()
      fetchAdminLogs()
    } catch (error: any) {
      message.error(error.response?.data?.message || '更新失败')
    }
  }

  const handleCreateShipment = async (values: any) => {
    try {
      await shipmentApi.create(id!, {
        provider: values.provider,
        tracking_number: values.tracking_number,
        estimated_arrival: values.estimated_arrival,
      })
      message.success('发货成功')
      setShipmentModalVisible(false)
      fetchOrderDetail()
      fetchAdminLogs()
    } catch (error: any) {
      message.error(error.response?.data?.message || '发货失败')
    }
  }

  const packageColumns = [
    {
      title: '运单号',
      dataIndex: 'domestic_tracking_no',
      key: 'domestic_tracking_no',
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
      title: '实际重量(kg)',
      dataIndex: 'actual_weight',
      key: 'actual_weight',
      render: (w: number) => w?.toFixed(2) || '-',
    },
    {
      title: '体积重量(kg)',
      dataIndex: 'volume_weight',
      key: 'volume_weight',
      render: (w: number) => w?.toFixed(2) || '-',
    },
    {
      title: '尺寸(cm)',
      key: 'dimensions',
      render: (_: any, record: Package) => 
        `${record.length || '-'} × ${record.width || '-'} × ${record.height || '-'}`,
    },
    {
      title: '入库时间',
      dataIndex: 'inbound_time',
      key: 'inbound_time',
      render: (date: string) => date ? dayjs(date).format('MM-DD HH:mm') : '-',
    },
  ]

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
  if (!order) return <div>订单不存在</div>

  return (
    <div>
      <Button 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate('/orders')}
        style={{ marginBottom: 16 }}
      >
        返回订单列表
      </Button>

      <Card title="订单详情" extra={
        <Space>
          {order.payment_status !== 'PAID' && (
            <Button 
              type="primary" 
              icon={<DollarOutlined />}
              onClick={() => {
                paymentForm.setFieldsValue({
                  status: order.payment_status,
                  final_price: order.final_price || order.estimated_price,
                })
                setPaymentModalVisible(true)
              }}
            >
              修改支付状态
            </Button>
          )}
          {order.payment_status === 'PAID' && !order.shipment && (
            <Button 
              type="primary" 
              icon={<TruckOutlined />}
              onClick={() => setShipmentModalVisible(true)}
            >
              标记发货
            </Button>
          )}
        </Space>
      }>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="订单ID">{order.id}</Descriptions.Item>
          <Descriptions.Item label="用户ID">{order.user_id}</Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <Tag color={statusMap[order.status]?.color}>
              {statusMap[order.status]?.label}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="支付状态">
            <Space>
              <Tag color={paymentStatusMap[order.payment_status]?.color}>
                {paymentStatusMap[order.payment_status]?.label}
              </Tag>
              {order.manual_override && <Tag size="small">人工标记</Tag>}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="计费重量">
            {order.chargeable_weight?.toFixed(2)} kg
          </Descriptions.Item>
          <Descriptions.Item label="金额">
            {order.final_price || order.estimated_price} {order.currency}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(order.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {dayjs(order.updated_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>

        {order.shipment && (
          <>
            <Divider orientation="left">物流信息</Divider>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="物流商">{order.shipment.provider}</Descriptions.Item>
              <Descriptions.Item label="追踪号">{order.shipment.tracking_number}</Descriptions.Item>
              <Descriptions.Item label="发货时间">
                {order.shipment.shipped_at ? dayjs(order.shipment.shipped_at).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="预计到达">
                {order.shipment.estimated_arrival ? dayjs(order.shipment.estimated_arrival).format('YYYY-MM-DD') : '-'}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}

        <Divider orientation="left">包裹列表 ({order.packages.length})</Divider>
        <Table 
          dataSource={order.packages} 
          columns={packageColumns} 
          rowKey="id"
          pagination={false}
          size="small"
        />

        {logs.length > 0 && (
          <>
            <Divider orientation="left">操作日志</Divider>
            <Timeline mode="left">
              {logs.map((log: any) => (
                <Timeline.Item key={log.id}>
                  <p>{dayjs(log.created_at).format('YYYY-MM-DD HH:mm:ss')}</p>
                  <p>操作: {log.action} | 管理员: {log.admin?.nickname || '-'}</p>
                </Timeline.Item>
              ))}
            </Timeline>
          </>
        )}
      </Card>

      {/* Payment Modal */}
      <Modal
        title="修改支付状态"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={null}
      >
        <Form form={paymentForm} onFinish={handleUpdatePayment} layout="vertical">
          <Form.Item
            name="status"
            label="支付状态"
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="UNPAID">未支付</Option>
              <Option value="PROCESSING">处理中</Option>
              <Option value="PAID">已支付</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="final_price"
            label="最终金额"
            rules={[{ required: true }]}
          >
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
                确认更新
              </Button>
              <Button onClick={() => setPaymentModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Shipment Modal */}
      <Modal
        title="标记发货"
        open={shipmentModalVisible}
        onCancel={() => setShipmentModalVisible(false)}
        footer={null}
      >
        <Form form={shipmentForm} onFinish={handleCreateShipment} layout="vertical">
          <Form.Item
            name="provider"
            label="物流商"
            rules={[{ required: true }]}
          >
            <Select placeholder="选择物流商">
              <Option value="UPS">UPS</Option>
              <Option value="DHL">DHL</Option>
              <Option value="EMS">EMS</Option>
              <Option value="FedEx">FedEx</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="tracking_number"
            label="追踪号码"
            rules={[{ required: true }]}
          >
            <Input placeholder="输入物流追踪号" />
          </Form.Item>
          <Form.Item
            name="estimated_arrival"
            label="预计到达日期"
          >
            <Input type="date" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<TruckOutlined />}>
                确认发货
              </Button>
              <Button onClick={() => setShipmentModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default OrderDetailPage
