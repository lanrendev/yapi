import React, { PureComponent as Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { Input, Layout, Collapse, Button, Spin } from 'antd';
import axios from 'axios';
import { connect } from 'react-redux';
import { setBreadcrumb } from '../../reducer/modules/user';
import { setCurrGroup, fetchGroupMsg } from '../../reducer/modules/group';
import { changeMenuItem } from '../../reducer/modules/menu';
import { fetchInterfaceListMenu } from '../../reducer/modules/interface';
import './GlobalSearch.scss';
const { Search } = Input;
const { Panel } = Collapse;

@connect(
  () => {
    return {};
  },
  {
    setBreadcrumb,
    setCurrGroup,
    changeMenuItem,
    fetchGroupMsg,
    fetchInterfaceListMenu
  }
)
@withRouter
export default class GlobalSearch extends Component {
  static propTypes = {
    params: PropTypes.object,
    setBreadcrumb: PropTypes.func,
    history: PropTypes.object,
    setCurrGroup: PropTypes.func,
    changeMenuItem: PropTypes.func,
    fetchInterfaceListMenu: PropTypes.func,
    fetchGroupMsg: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dataSource: {
        group: [],
        project: [],
        interface: []
      },
      serachValue: new URLSearchParams(decodeURIComponent(location.search)).get('q') || ''
    };
  }

  componentDidMount() {
    this.props.setBreadcrumb([{ name: '全局搜索' }]);
    this.handleSearch();
    window.addEventListener('', () => {

      console.log('change')
    })
  }

  generateHTML(raw, keyword) {
    if (Array.isArray(raw)) {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: raw
              .map(
                item =>
                  `<span>${item.replace(
                    new RegExp(keyword, 'ig'),
                    `<span style="color: red">${keyword}</span>`
                  )}</span>`
              )
              .join(' ')
          }}
        />
      );
    } else {
      return (
        <span
          dangerouslySetInnerHTML={{
            __html: `<span>${raw.replace(
              new RegExp(keyword, 'ig'),
              `<span style="color: red">${keyword}</span>`
            )}</span>`
          }}
        />
      );
    }
  }

  handleSearch = () => {
    this.props.history.push('/global-search?q='+ this.state.serachValue)
    this.setState({
      loading: true
    });
    axios
      .get(`/api/project/globalSearch?q=${this.state.serachValue}`)
      .then(res => {
        if (res.data && res.data.errcode === 0) {
          this.setState({
            dataSource: res.data.data
          });
        } else {
          this.setState({
            dataSource: {
              group: [],
              project: [],
              interface: []
            }
          });
          console.log('查询项目或分组失败');
        }
        this.setState({
          loading: false
        });
      })
      .catch(err => {
        console.log(err);
      });
  };

  render() {
    return (
      <div className="search-container">
        <Layout
          style={{
            marginLeft: "24px",
            marginRight: "24px",
            marginTop: "24px"
          }}
        >
          <Search
            value={this.state.serachValue}
            enterButton
            onSearch={this.handleSearch}
            onChange={e => {
              this.setState({ serachValue: e.target.value });
            }}
            style={{ width: 300 }}
          />
          <Spin spinning={this.state.loading}>
            {this.state.dataSource.group.length ||
            this.state.dataSource.project.length ||
            this.state.dataSource.interface.length ? (
              <Collapse style={{ marginTop: "14px" }} accordion={true}>
                {this.state.dataSource.group.map((item, index) => (
                  <Panel
                    header={
                      <div>
                        {`分组：${item.groupName}`}
                        <Button
                          style={{ float: "right", margin: "-5px 30px 0 0" }}
                          onClick={e => {
                            e.stopPropagation();
                            this.props.changeMenuItem('/group');
                            this.props.history.push('/group/' + item['_id']);
                            this.props.setCurrGroup({
                              group_name: item.groupName,
                              _id: item['_id']
                            });
                          }}
                          type="primary"
                        >
                          查看
                        </Button>
                      </div>
                    }
                    key={`group${index}`}
                  >
                    {item.matchResult.name && (
                      <p>
                        分组名称：
                        {this.generateHTML(
                          item.matchResult.name,
                          item.matchResult.keyword
                        )}
                      </p>
                    )}
                    {item.matchResult.desc && (
                      <p>
                        分组简介：
                        {this.generateHTML(
                          item.matchResult.desc,
                          item.matchResult.keyword
                        )}
                      </p>
                    )}
                  </Panel>
                ))}
                {this.state.dataSource.project.map((item, index) => (
                  <Panel
                    header={
                      <div>
                        {`项目：${item.name}`}
                        <Button
                          style={{ float: "right", margin: "-5px 30px 0 0" }}
                          onClick={async e => {
                            e.stopPropagation();
                            await this.props.fetchGroupMsg(item.groupId);
                            this.props.history.push('/project/' + item['_id']);
                          }}
                          type="primary"
                        >
                          查看
                        </Button>
                      </div>
                    }
                    key={`project${index}`}
                  >
                    {item.matchResult.name && (
                      <p>
                        项目名称：
                        {this.generateHTML(
                          item.matchResult.name,
                          item.matchResult.keyword
                        )}
                      </p>
                    )}
                    {item.matchResult.desc && (
                      <p>
                        项目名称：
                        {this.generateHTML(
                          item.matchResult.desc,
                          item.matchResult.keyword
                        )}
                      </p>
                    )}
                  </Panel>
                ))}
                {this.state.dataSource.interface.map((item, index) => (
                  <Panel
                    header={
                      <div>
                        {`接口：${item.title}`}
                        <Button
                          style={{ float: "right", margin: "-5px 30px 0 0" }}
                          onClick={e => {
                            e.stopPropagation();
                            this.props.history.push(
                              '/project/' +
                                item['projectId'] +
                                '/interface/api/' +
                                item['_id']
                            );
                            this.props.fetchInterfaceListMenu(
                              item['projectId']
                            );
                          }}
                          type="primary"
                        >
                          查看
                        </Button>
                      </div>
                    }
                    key={`interface${index}`}
                  >
                    <Collapse
                      bordered={false}
                      defaultActiveKey={['1', '2', '3', '4', '5']}
                    >
                      {(item.matchResult.isTitleMatch ||
                        item.matchResult.isPathMatch ||
                        item.matchResult.isRemarkMatch) && (
                        <Panel header="基本信息" key="1">
                          {item.matchResult.isTitleMatch && (
                            <p>
                              接口名称：
                              {this.generateHTML(
                                item.matchResult.title,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {item.matchResult.isPathMatch && (
                            <p>
                              接口路径：
                              {this.generateHTML(
                                item.matchResult.path,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {item.matchResult.isRemarkMatch && (
                            <p>
                              接口备注：
                              {this.generateHTML(
                                item.matchResult.remark,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                        </Panel>
                      )}
                      {item.matchResult.isRequestHeadersMatch && (
                        <Panel header="请求参数（Header）" key="2">
                          {!!item.matchResult.requestHeaders.name.length && (
                            <p>
                              参数名称：
                              {this.generateHTML(
                                item.matchResult.requestHeaders.name,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {!!item.matchResult.requestHeaders.value.length && (
                            <p>
                              参数值：
                              {this.generateHTML(
                                item.matchResult.requestHeaders.value,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {!!item.matchResult.requestHeaders.example.length && (
                            <p>
                              参数示例：
                              {this.generateHTML(
                                item.matchResult.requestHeaders.example,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {!!item.matchResult.requestHeaders.desc.length && (
                            <p>
                              参数备注：
                              {this.generateHTML(
                                item.matchResult.requestHeaders.desc,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                        </Panel>
                      )}
                      {item.matchResult.isRequestQueryMatch && (
                        <Panel header="请求参数（Query）" key="3">
                          {!!item.matchResult.requestQuery.name.length && (
                            <p>
                              参数名称：
                              {this.generateHTML(
                                item.matchResult.requestQuery.name,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {!!item.matchResult.requestQuery.example.length && (
                            <p>
                              参数示例：
                              {this.generateHTML(
                                item.matchResult.requestQuery.example,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {!!item.matchResult.requestQuery.desc.length && (
                            <p>
                              参数备注：
                              {this.generateHTML(
                                item.matchResult.requestQuery.desc,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                        </Panel>
                      )}

                      {item.matchResult.isRequestBodyMatch && (
                        <Panel header="请求参数（Body）" key="4">
                          {!!item.matchResult.requestBody.name.length && (
                            <p>
                              参数名称：
                              {this.generateHTML(
                                item.matchResult.requestBody.name,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {!!item.matchResult.requestBody.example.length && (
                            <p>
                              参数示例：
                              {this.generateHTML(
                                item.matchResult.requestBody.example,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {!!item.matchResult.requestBody.desc.length && (
                            <p>
                              参数备注：
                              {this.generateHTML(
                                item.matchResult.requestBody.desc,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                        </Panel>
                      )}
                      {item.matchResult.isResponseBodyMatch && (
                        <Panel header="返回数据" key="5">
                          {!!item.matchResult.responseBody.name.length && (
                            <p>
                              参数名称：
                              {this.generateHTML(
                                item.matchResult.responseBody.name,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                          {!!item.matchResult.responseBody.desc.length && (
                            <p>
                              参数备注：
                              {this.generateHTML(
                                item.matchResult.responseBody.desc,
                                item.matchResult.keyword
                              )}
                            </p>
                          )}
                        </Panel>
                      )}
                    </Collapse>
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <div style={{ textAlign: "center", marginTop: "100px"}}>
                暂无数据
              </div>
            )}
          </Spin>
        </Layout>
      </div>
    );
  }
}