import React, { Component } from 'react';
import AddButton from '../fragments/fixedButton/AddButton';
import { withAuth, AuthProps } from '../utils/auth';
import { Role, Tag } from '../utils';
import { Tree } from 'antd';

const { TreeNode } = Tree;
export interface State {
  tags: Tag[];
  modifyVisible: boolean;
}

interface Props extends AuthProps {
  getTags: () => Promise<Tag[]>;
}

class Tags extends Component<Props, State> {
  public state: State = {
    tags: [],
    modifyVisible: false
  };

  public async componentDidMount() {
    const data = await this.getDatas();
    this.setState({
      tags: data.filter(t => t.is_active && !t.parent_id)
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

  public render() {

    const loop = (tags2: Tag[]) =>
      tags2.map(tag => {
        if (tag.children && tag.children.length) {
          return (
            <TreeNode key={String(tag.id)} title={tag.name}>
              {loop(tag.children)}
            </TreeNode>
          );
        }
        return <TreeNode key={String(tag.id)} title={tag.name} />;
      });

    return [
      <Tree
        key={1}
        className='draggable-tree'
        draggable={false}
        onDragEnter={this.onDragEnter}
        onDrop={this.onDrop}
      >
        {loop(this.state.tags)}
      </Tree>
    ];
  }
}
export default withAuth(Tags);
