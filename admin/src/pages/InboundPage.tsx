import { useState } from 'react'
import { Form, Input, InputNumber, Button, Card, message, Space, Divider, Select } from 'antd'
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { packageApi } from '../api/client'

interface GoodsItem {
  name: string
  quantity: number
  unit_value?: number
}

const InboundPage: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [volumeWeight, setVolumeWeight] = useState<number | null>(null)

  const calculateVolumeWeight = () => {
    const length = form.getFieldValue('length') || 0
    const width = form.getFieldValue('width') || 0
    const height = form.getFieldValue('height') || 0
    const volWeight = (length * width * height) / 6000
    setVolumeWeight(volWeight)
    return volWeight
  }

  const handleValuesChange = (changedValues: any) => {
    if (changedValues.length || changedValues.width || changedValues.height) {
      calculateVolumeWeight()
    }
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const volWeight = calculateVolumeWeight()
      const chargeableWeight = Math.max(values.actual_weight, volWeight)

      const data = {
        user_id: values.user_id,
        domestic_tracking_no: values.domestic_tracking_no,
        source_platform: values.source_platform,
        actual_weight: values.actual_weight,
        length: values.length,
        width: values.width,
        height: values.height,
        notes: values.notes,
        goods_items: values.goods_items,
      }

      const { data: result } = await packageApi.inbound(data)

      // Mock image upload - in real scenario, upload to COS first
      const mockImages = [
        { type: 'OUTER', url: 'https://mock-cos.com/package-outer.jpg' },
        { type: 'LABEL', url: 'https://mock-cos.com/package-label.jpg' },
      ]
      await packageApi.uploadImages(result.id, mockImages)

      message.success(`包裹入库成功！计费重量: ${chargeableWeight.toFixed(2)} kg`)
      form.resetFields()
      setVolumeWeight(null)
    } catch (error: any) {
      message.error(error.response?.data?.message || '入库失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800 }}>
      <Card title="包裹入库">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValuesChange}
        >
          <Divider orientation="left">基本信息</Divider>
          
          <Form.Item
            name="user_id"
            label="用户ID"
            rules={[{ required: true, message: '请输入用户ID' }]}
          >
            <Input placeholder="用户ID" />
          </Form.Item>

          <Form.Item
            name="domestic_tracking_no"
            label="国内运单号"
            rules={[{ required: true, message: '请输入运单号' }]}
          >
            <Input placeholder="例如: SF1234567890" />
          </Form.Item>

          <Form.Item name="source_platform" label="来源平台">
            <Select placeholder="选择电商平台" allowClear>
              <Select.Option value="taobao">淘宝</Select.Option>
              <Select.Option value="tmall">天猫</Select.Option>
              <Select.Option value="jd">京东</Select.Option>
              <Select.Option value="pdd">拼多多</Select.Option>
              <Select.Option value="other">其他</Select.Option>
            </Select>
          </Form.Item>

          <Divider orientation="left">尺寸重量</Divider>

          <Space align="start">
            <Form.Item
              name="length"
              label="长 (cm)"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} precision={1} />
            </Form.Item>
            <Form.Item
              name="width"
              label="宽 (cm)"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} precision={1} />
            </Form.Item>
            <Form.Item
              name="height"
              label="高 (cm)"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} precision={1} />
            </Form.Item>
            <Form.Item
              name="actual_weight"
              label="实际重量 (kg)"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} precision={2} />
            </Form.Item>
          </Space>

          {volumeWeight !== null && (
            <Card size="small" style={{ marginBottom: 16, background: '#f6ffed' }}>
              <Space direction="vertical">
                <div>体积重量: {volumeWeight.toFixed(2)} kg (L×W×H/6000)</div>
                <div style={{ color: '#52c41a', fontWeight: 'bold' }}>
                  计费重量: {Math.max(form.getFieldValue('actual_weight') || 0, volumeWeight).toFixed(2)} kg
                </div>
              </Space>
            </Card>
          )}

          <Divider orientation="left">物品清单</Divider>

          <Form.List name="goods_items">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'name']}
                      rules={[{ required: true, message: '物品名称' }]}
                    >
                      <Input placeholder="物品名称" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'quantity']}
                      rules={[{ required: true }]}
                    >
                      <InputNumber min={1} placeholder="数量" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'unit_value']}
                    >
                      <InputNumber min={0} precision={2} placeholder="单价" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加物品
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={2} placeholder="入库备注信息" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large" block>
              确认入库
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default InboundPage
