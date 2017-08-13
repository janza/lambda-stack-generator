import React, { Component } from 'react'
import mustache from 'mustache'
import CopyToClipboard from 'react-copy-to-clipboard'
import Highlighter from 'react-syntax-highlighter'
import 'antd/dist/antd.css'
import {
  Layout,
  Menu,
  Breadcrumb,
  Row,
  Col,
  Input,
  Form,
  Cascader,
  Slider,
  Tabs
} from 'antd'

import templateUrl from './template.yaml'
import lambdaTemplateUrl from './lambda_template.yaml'

const { Header, Content, Footer } = Layout
const { TabPane } = Tabs

class Template extends Component {
  constructor (props) {
    super(props)
    this.state = {
      template: null
    }
  }
  componentDidMount () {
    window
      .fetch(this.props.url)
      .then(response => {
        if (response.ok) {
          return response.text()
        }
        throw new Error('Network response was not ok.')
      })
      .then(template => {
        this.setState({
          template: template
        })
      })
      .catch(err => console.log(err))
  }
  render () {
    if (!this.state.template) return null
    const renderedTemplate = mustache.render(this.state.template, this.props)
    return (
      <div style={{ position: 'relative' }}>
        <CopyToClipboard
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px'
          }}
          text={renderedTemplate}
        >
          <button>Copy to clipboard</button>
        </CopyToClipboard>
        <Highlighter language='yaml'>
          {renderedTemplate}
        </Highlighter>
      </div>
    )
  }
}

class PipelineTemplate extends Component {
  getBuildImage () {
    return {
      'nodejs6.10': 'aws/codebuild/eb-nodejs-6.10.0-amazonlinux-64:4.0.0',
      'nodejs4.3': 'aws/codebuild/eb-nodejs-4.4.6-amazonlinux-64:2.1.3',
      'python2.7': 'aws/codebuild/eb-python-2.7-amazonlinux-64:2.3.2',
      'python3.6': 'aws/codebuild/eb-python-3.6-amazonlinux-64:2.3.2'
    }[this.props.runtime]
  }

  render () {
    return (
      <Template
        url={templateUrl}
        {...{
          name: this.props.name,
          buildImage: this.getBuildImage()
        }}
      />
    )
  }
}

const LambdaTemplate = props => <Template url={lambdaTemplateUrl} {...props} />

class Editor extends Component {
  render () {
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 14 }
      }
    }

    const formItems = [
      {
        label: 'Name',
        id: 'name',
        required: true,
        message: 'Provide a name for the service',
        element: <Input />
      },
      {
        label: 'Runtime',
        id: 'runtime',
        initialValue: ['nodejs', '6.10'],
        element: (
          <Cascader
            options={[
              {
                value: 'nodejs',
                label: 'Node',
                children: [
                  {
                    value: '6.10',
                    label: 'v6.10'
                  },
                  {
                    value: '4.3',
                    label: 'v4.3'
                  }
                ]
              },
              {
                value: 'python',
                label: 'Python',
                children: [
                  {
                    value: '2.7',
                    label: 'v2.7'
                  },
                  {
                    value: '3.6',
                    label: 'v3.6'
                  }
                ]
              }
            ]}
          />
        )
      },
      {
        label: 'Timeout',
        id: 'timeout',
        message: 'Provide a timeout',
        initialValue: 3,
        element: <Slider min={1} max={300} />
      },
      {
        label: 'Memory size',
        id: 'memorySize',
        message: 'Provide memory size',
        initialValue: 128,
        element: <Slider min={128} max={1536} step={64} />
      }
    ].map(({ id, label, required, message, element, initialValue }, index) =>
      <Form.Item key={index} {...formItemLayout} label={label} hasFeedback>
        {getFieldDecorator(id, {
          initialValue,
          rules: [
            {
              required,
              message
            }
          ]
        })(element)}
      </Form.Item>
    )

    const values = this.props.form.getFieldsValue()

    return (
      <Row>
        <Col span={12}>
          <Form onSubmit={this.handleSubmit}>
            {formItems}
          </Form>
        </Col>
        <Col span={12}>
          <Tabs defaultActiveKey='1'>
            <TabPane tab='Lambda Template' key='1'>
              <LambdaTemplate
                name={values.name}
                runtime={values.runtime.join('')}
                timeout={values.timeout}
                memorySize={values.memorySize}
              />
            </TabPane>
            <TabPane tab='CodePipeline Template' key='2'>
              <PipelineTemplate
                name={values.name}
                runtime={values.runtime.join('')}
              />
            </TabPane>
          </Tabs>
        </Col>
      </Row>
    )
  }
}

const FormEditor = Form.create()(Editor)

class App extends Component {
  render () {
    return (
      <Layout className='layout'>
        <Header>
          <div className='logo' />
          <Menu
            theme='dark'
            mode='horizontal'
            defaultSelectedKeys={['1']}
            style={{ lineHeight: '64px' }}
          >
            <Menu.Item key='1'>App</Menu.Item>
          </Menu>
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '12px 0' }}>
            <Breadcrumb.Item>Setup</Breadcrumb.Item>
            <Breadcrumb.Item>Get the template</Breadcrumb.Item>
          </Breadcrumb>
          <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            <FormEditor />
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Author: <a href='https://github.com/janza/'>janza</a>
        </Footer>
      </Layout>
    )
  }
}

export default App
