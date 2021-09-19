import React, { useState } from 'react';
import { Table, Input, InputNumber, Popconfirm, Form, Typography ,notification} from 'antd';
import axios from "axios";


const EditableCell = ({
    editing,
    dataIndex,
    title,
    inputType,
    record,
    index,
    children,
    ...restProps
  }) => {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            {inputNode}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

export default function App() {
    const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingKey, setEditingKey] = useState('');
  const [orderID, setOrderID] = useState('');

  const openNotificationWithIcon = type => {
    notification[type]({
      message: 'Sipariş Tarihi Değişimi',
      description:
        'Sipariş Tarihi Değişimi Beklenen Günden erken olduğu için Yapılamadı.',
    });
  };
  

const headers = {'Content-Type': 'application/json'}
  const fetchOrder = async () => {
    const result = await axios.get(
      `http://localhost:5000`,
      {
        headers,
      }
    );

    console.log(result.data);
    setData(result.data);
  };



  React.useEffect(() => {
     fetchOrder();
  }, [])

  ;

  const isEditing = (record) => record.ID === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      OrderDate: '',
      ...record,
    });
    
    setEditingKey(record.ID);

  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
        const newOrderDate = orderID.replaceAll("/", "");
       const IntOrderDate = parseInt(newOrderDate);
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.ID);
     
      
      if (index > -1  && IntOrderDate == orderID) {
        const item = newData[index];
        newData.splice(index, 1, { ...item, ...row });
        setData(newData);
        setEditingKey('');
      } else {
        openNotificationWithIcon('error')
        setData(newData);
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'OrderNumber',
      dataIndex: 'OrderNumber',
      width: '15%',
      editable: false,
    },
    {
      title: 'OrderDate',
      dataIndex: 'OrderDate',
      width: '40%',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <a
              href="javascript:;"
              onClick={() => save(record.ID)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </a>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => {edit(record); setOrderID(record.OrderDate)}}>
            Edit
          </Typography.Link>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType:  'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return(
    <Form form={form} component={false}>
    <Table
      components={{
        body: {
          cell: EditableCell,
        },
      }}
      bordered
      dataSource={data}
      columns={mergedColumns}
      rowClassName="editable-row"
      pagination={{
        onChange: cancel,
      }}
    />
  </Form>
  )
}

