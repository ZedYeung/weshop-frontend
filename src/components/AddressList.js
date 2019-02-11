import React, { Component } from 'react';
import { Table, Button, Popconfirm } from 'antd';
import { getAddresses, deleteAddress, updateAddress } from './api';
import { EditableCell, EditableFormRow, EditableContext } from './EditableTable';


export class AddressList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            addresses: [],
            editingKey: '',
        }

        this.columns = [{
            title: 'Fullname',
            dataIndex: 'fullname',
            key: "fullname",
            editable: true,
        }, {
            title: 'Phone',
            dataIndex: 'phone',
            key: "phone",
            editable: true,
        }, {
            title: 'Address1',
            dataIndex: 'address1',
            key: "address1",
            editable: true,
        }, {
            title: 'Address2',
            dataIndex: 'address2',
            key: "address2",
            editable: true,
        }, {
            title: 'City',
            dataIndex: 'city',
            key: "city",
            editable: true,
        }, {
            title: 'State',
            dataIndex: 'state',
            key: "state",
            editable: true,
        }, {
            title: 'Zipcode',
            dataIndex: 'zipcode',
            key: "zipcode",
            editable: true,
        }, {
            title: 'Country',
            dataIndex: 'country',
            key: "country",
            editable: true,
        }, {
            title: 'Action',
            dataIndex: 'id',
            key: "id",
            render: (id, record) => {
                console.log(record)
                console.log(id)
                const editable = this.isEditing(record);
                return (
                  <div>
                    {editable ? (
                      <div>
                        <EditableContext.Consumer>
                          {form => (
                            <Button onClick={() => this.saveEdit(form, id)}>
                                Save
                            </Button>
                          )}
                        </EditableContext.Consumer>
                        <Popconfirm
                          title="Sure to cancel?"
                          onConfirm={() => this.cancelEdit(id)}
                        >
                          <Button>Cancel</Button>
                        </Popconfirm>
                      </div>
                    ) : (
                        <div>
                            <Button onClick={() => this.edit(id)}>Edit</Button>
                            <Button onClick={(e) => this.handleDelete(id, e)} >Delete</Button>
                        </div>
                    )}

                  </div>
            )
                    }
        }];
    }
    componentDidMount() {
        getAddresses(

        ).then((res) => {
            console.log(res)
            this.setState({
                addresses: res.data,
            })
        }).catch((err) => {
            console.log(err);
        })
    }

    handleDelete = (addressID, e) => {
        deleteAddress (
            addressID
        ).then((res) => {
            this.setState({
                addresses: this.state.addresses.filter((address) => address.id !== addressID)
            })
        }).catch((err) => {
            console.log(err);
        })
    }

    isEditing = (record) => record.id === this.state.editingKey;

    cancelEdit = () => {
        this.setState({ editingKey: '' });
    };

    edit = (id) => {
        this.setState({ editingKey: id }, () => console.log(id, this.state));
    }

    saveEdit = (form, id) => {
        form.validateFields((error, row) => {
            if (error) {
                return;
            }

            const newAddresses = [...this.state.addresses];
            const index = newAddresses.findIndex(item => id === item.id);
            if (index > -1) {
                const item = newAddresses[index];
                newAddresses.splice(index, 1, {
                    ...item,
                    ...row,
                });

                updateAddress(
                    item.id, row
                ).then((res) => {
                    this.setState({ addresses: newAddresses, editingKey: '' });
                }).catch((err) => {
                    console.log(err);
                })
            } else {
                newAddresses.push(row);
                this.setState({ addresses: newAddresses, editingKey: '' });
            }
        });
    }

    handleAdd = () => {
        const { addresses } = this.state;
        const newAddress = {
          fullname: '',
          phone: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          zipcode: '',
          country: '',
        };
        this.setState({
            addresses: [...addresses, newAddress],
        });
    }

    render() {
        const components = {
            body: {
              row: EditableFormRow,
              cell: EditableCell,
            },
          };

        const columns = this.columns.map((col) => {
            if (!col.editable) {
              return col;
            }
            return {
              ...col,
              onCell: record => ({
                record,
                inputType: 'text',
                dataIndex: col.dataIndex,
                title: col.title,
                editing: this.isEditing(record),
              }),
            };
          });

        return (
            <Table
                className="address-table"
                components={components}
                rowClassName="editable-row"
                rowKey={record => record.id} 
                columns={columns}
                dataSource={this.state.addresses}
                footer={(data) => (
                    <Button onClick={this.handleAdd} type="primary" style={{ marginBottom: 16 }}>
                        Add Address
                    </Button>
                )}
            />
        )
    }
}