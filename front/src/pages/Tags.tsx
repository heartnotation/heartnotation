import React, { Component } from 'react';
import { withAuth, AuthProps } from '../utils/auth';
import { Tag } from '../utils';
import ant, { Tree, Icon, Modal } from 'antd';
import TagCreation from './TagCreation';
import { string } from 'prop-types';

const { TreeNode } = Tree;
export interface State {
  tags: Tag[];
  tagEditVisible: boolean;
  tagCreationVisible: boolean;
  parent_id?: number;
  keepCreationData: boolean;
  error: string;
}

interface Props {
  getTags: () => Promise<Tag[]>;
  sendTag: (datas: Tag) => Promise<Tag>;
  disableTagByID: (datas: number) => Promise<Tag>;
  modifyTagByID: (datas: Tag) => Promise<Tag>;
}

class Tags extends Component<Props, State> {
  public state: State = {
    tags: [],
    tagEditVisible: false,
    tagCreationVisible: false,
    keepCreationData: false,
    error: ''
  };

  public async componentDidMount() {
    try {
      const data = await this.getDatas();
      this.setState({
        tags: data.filter(t => !t.parent_id)
      });
    } catch (_) {
      this.setState({ error: 'Failed to load datas' });
    }
  }

  public async getDatas(): Promise<Tag[]> {
    try {
      const tags = await this.props.getTags();
      return tags;
    } catch (e) {
      throw e;
    }
  }

  public onDrop = (info: any) => {
    const dropKey = info.node.props.eventKey;
    const dragKey = info.dragNode.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition =
      info.dropPosition - Number(dropPos[dropPos.length - 1]);

    const loop = (datas: any, key: any, callback: any) => {
      datas.forEach((item: any, index: any, arr: any) => {
        if (item.key === key) {
          return callback(item, index, arr);
        }
        if (item.children) {
          return loop(item.children, key, callback);
        }
      });
    };
    const data = [...this.state.tags];

    // Find dragObject
    let dragObj: any;
    loop(data, dragKey, (item: any, index: any, arr: any) => {
      arr.splice(index, 1);
      dragObj = item;
    });

    if (!info.dropToGap) {
      // Drop on the content
      loop(data, dropKey, (item: any) => {
        item.children = item.children || [];
        item.children.push(dragObj);
      });
    } else if (
      (info.node.props.children || []).length > 0 && // Has children
      info.node.props.expanded && // Is expanded
      dropPosition === 1 // On the bottom gap
    ) {
      loop(data, dropKey, (item: any) => {
        item.children = item.children || [];
        item.children.unshift(dragObj);
      });
    } else {
      let ar: any;
      let i: any;
      loop(data, dropKey, (_: any, index: any, arr: any) => {
        ar = arr;
        i = index;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }

    this.setState({
      tags: data
    });
  }

  public createHandleOk = async () => {
    this.closeModalCreation();
    try {
      const data = await this.getDatas();
      this.setState({
        tags: data.filter(t => !t.parent_id), // t.is_active &&
        tagCreationVisible: false,
        keepCreationData: false,
        parent_id: undefined
      });
    } catch (_) {
      this.setState({ error: 'Failed to refresh datas' });
    }
  }

  public createHandleCancel = () => {
    this.closeModalCreation();
  }

  public closeModalCreation = () => {
    this.setState({
      tagCreationVisible: false
    });
  }

  public addTag = () => {
    this.setState({
      tagCreationVisible: true,
      keepCreationData: true
    });
  }

  public disableTag = (tagID: number) => {
    const { disableTagByID } = this.props;
    Modal.confirm({
      title: 'Do you want to disable this tag?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        disableTagByID(tagID)
          .then(async () => {
            try {
              const data = await this.getDatas();
              this.setState({
                tags: data.filter(t => !t.parent_id)
              });
            } catch {
              this.setState({ error: 'Failed to refresh datas' });
            }
          })
          .catch(() => this.setState({ error: 'Failed to disable tag' }));
      }
    });
  }

  public enableTag = (tag: Tag) => {
    const { modifyTagByID } = this.props;
    Modal.confirm({
      title: 'Do you want to enable this tag?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        modifyTagByID(tag)
          .then(async () => {
            try {
              const data = await this.getDatas();
              this.setState({
                tags: data.filter(t => !t.parent_id)
              });
            } catch {
              this.setState({ error: 'Failed to refresh datas' });
            }
          })
          .catch(() => this.setState({ error: 'Failed to disable tag' }));
      }
    });
  }

  public render() {
    const {
      tagCreationVisible,
      parent_id,
      keepCreationData,
      tags
    } = this.state;
    const { sendTag } = this.props;
    const loop = (tags2: Tag[]) =>
      tags2.map(tag => {
        if (tag.children && tag.children.length) {
          return (
            <TreeNode
              className='tag_wrapper'
              key={String(tag.id)}
              title={
                <div>
                  <span
                    className={
                      tag.is_active ? 'tag_title' : 'tag_title_disabled'
                    }
                    style={{ opacity: 0.4, fontWeight: 'bold' }}
                  >
                    <ant.Tag color={tag.color} key={tag.name}>
                      {tag.name}&nbsp;&nbsp;
                    </ant.Tag>
                  </span>
                  {tag.is_active && (
                    <a
                      className='add_tag'
                      onClick={() => {
                        this.setState({
                          parent_id: tag.id
                        });
                        this.addTag();
                      }}
                    >
                      <Icon type='plus' />
                    </a>
                  )}
                  &nbsp;&nbsp;
                  {tag.is_active && (
                    <a
                      className='disable_tag'
                      onClick={() => {
                        this.disableTag(tag.id);
                      }}
                    >
                      <Icon type='stop' />
                    </a>
                  )}
                  {!tag.is_active && (
                    <a
                      className='enable_tag'
                      onClick={() => {
                        tag.is_active = true;
                        this.enableTag(tag);
                      }}
                    >
                      <Icon type='check' />
                    </a>
                  )}
                </div>
              }
            >
              {loop(tag.children)}
            </TreeNode>
          );
        }
        return (
          <TreeNode
            className='tag_wrapper'
            key={String(tag.id)}
            title={
              <div>
                <span
                  className={tag.is_active ? 'tag_title' : 'tag_title_disabled'}
                  style={{ color: tag.color }}
                >
                  <ant.Tag
                    color={tag.color}
                    key={tag.name}
                    style={{ opacity: 0.4, fontWeight: 'bold' }}
                  >
                    {tag.name}&nbsp;&nbsp;
                  </ant.Tag>
                </span>
                {tag.is_active && (
                  <a
                    className='add_tag'
                    onClick={() => {
                      this.setState({
                        parent_id: tag.id
                      });
                      this.addTag();
                    }}
                  >
                    <Icon type='plus' />
                  </a>
                )}
                &nbsp;&nbsp;
                {tag.is_active && (
                  <a
                    className='disable_tag'
                    onClick={() => {
                      this.disableTag(tag.id);
                    }}
                  >
                    <Icon type='stop' />
                  </a>
                )}
                {!tag.is_active && (
                  <a
                    className='enable_tag'
                    onClick={() => {
                      tag.is_active = true;
                      this.enableTag(tag);
                    }}
                  >
                    <Icon type='check' />
                  </a>
                )}
              </div>
            }
          />
        );
      });

    return [
      <Tree
        key={1}
        className='draggable-tree'
        draggable={false}
        onDrop={this.onDrop}
        switcherIcon={<Icon type='down' />}
        selectable={false}
      >
        <TreeNode
          className='tag_wrapper'
          title={
            <div>
              <a onClick={this.addTag}>
                <Icon type='plus' />
              </a>
            </div>
          }
        />
        {loop(tags)}
      </Tree>,
      keepCreationData && (
        <TagCreation
          key={2}
          parent_id={parent_id}
          modalVisible={tagCreationVisible}
          handleOk={this.createHandleOk}
          handleCancel={this.createHandleCancel}
          sendTag={sendTag}
        />
      )
    ];
  }
}
export default Tags;
