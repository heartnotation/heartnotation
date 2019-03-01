import React, { Component } from 'react';
import AddButton from '../fragments/fixedButton/AddButton';
import { withAuth, AuthProps } from '../utils/auth';
import { Role, Tag } from '../utils';
import { Tree, Icon, Modal } from 'antd';
import { inherits } from 'util';
import TagCreation from './TagCreation';

const { TreeNode } = Tree;
export interface State {
  tags: Tag[];
  tagEditVisible: boolean;
  tagCreationVisible: boolean;
  parent_id?: number;
  keepCreationData: boolean;
}

interface Props extends AuthProps {
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
    keepCreationData: false
  };

  public async componentDidMount() {
    const data = await this.getDatas();
    this.setState({
      tags: data.filter(t => !t.parent_id)
    });
  }

  public async getDatas(): Promise<Tag[]> {
    const tags = await this.props.getTags();
    return tags;
  }

  public onDragEnter = (info: any) => {
    console.log(info);
  }

  public onDrop = (info: any) => {
    console.log(info);
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
      loop(data, dropKey, (item: any, index: any, arr: any) => {
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
    const data = await this.getDatas();
    this.setState({
      tags: data.filter(t => !t.parent_id), // t.is_active &&
      tagCreationVisible: false,
      keepCreationData: false,
      parent_id: undefined
    });
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

  public disableTag = async (tagID: number) => {
    const { disableTagByID } = this.props;
    Modal.confirm({
      title: 'Do you want to disable this tag?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
          disableTagByID(tagID).then(async () => {
            const data = await this.getDatas();
            this.setState({
              tags: data.filter(t => !t.parent_id)
            });
          });
      },
      onCancel: () => {
        //
      }
    });
  }

  public enableTag = async (tag: Tag) => {
    const { modifyTagByID } = this.props;
    Modal.confirm({
      title: 'Do you want to enable this tag?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        modifyTagByID(tag).then(async () => {
          const data = await this.getDatas();
          this.setState({
            tags: data.filter(t => !t.parent_id)
          });
        });
      },
      onCancel: () => {
        //
      }
    });
  }

  public render() {
    const { tagCreationVisible, parent_id, keepCreationData } = this.state;
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
                  >
                    {tag.name}&nbsp;&nbsp;
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
                >
                  {tag.name}&nbsp;&nbsp;
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
        onDragEnter={this.onDragEnter}
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
        {loop(this.state.tags)}
      </Tree>,
      keepCreationData && (
        <TagCreation
          key={2}
          parent_id={parent_id}
          modalVisible={tagCreationVisible}
          handleOk={this.createHandleOk}
          handleCancel={this.createHandleCancel}
          sendTag={this.props.sendTag}
        />
      )
    ];
  }
}
export default withAuth(Tags);
