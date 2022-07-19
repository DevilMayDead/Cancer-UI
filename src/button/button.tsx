import React from 'react';
import { ConfigContext } from '../config-provider';
import { SizeType } from '../config-provider/SizeContext';
import { tuple } from '../_util/type';
import SizeContext from '../config-provider/SizeContext';

/** 两个中文字符正则表达式 */
const rxTwoChar = /^[\u4e00-\u9fa5]{2}$/;
const isTwoCNChar = rxTwoChar.test.bind(rxTwoChar);

/** 判断是否是字符类型 */
function isString(str: any) {
  return typeof str === 'string';
}

/** 判断节点类型是否为ReactFragment */
function isReactFragment(node: React.ReactNode) {
  return React.isValidElement(node) && node.type === React.Fragment;
}

function insertSpace(child: React.ReactChild, needInserted: boolean) {
  if (child === null || child === undefined) {
    return;
  }
  const SPACE = needInserted ? ' ' : '';
  console.log(child);
  if (
    typeof child !== 'string' &&
    typeof child !== 'number' &&
    isString(child.type) &&
    isTwoCNChar(child.props.children)
  ) {
    console.log('child');
    return React.cloneElement(child, {
      children: child.props.children.split('').join(SPACE),
    });
  }
  if (typeof child === 'string') {
    return isTwoCNChar(child) ? <span>{child.split('').join(SPACE)}</span> : <span>{child}</span>;
  }
  if (isReactFragment(child)) {
    return <span>{child}</span>;
  }
  return child;
}

function spaceChildren(children: React.ReactNode, needInserted: boolean) {
  let isPrevChildPure: boolean = false;
  const childList: React.ReactNode[] = [];
  React.Children.forEach(children, (child) => {
    const type = typeof child;
    const isCurrentChildPure = type === 'string' || type === 'number';
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }

    isPrevChildPure = isCurrentChildPure;
  });

  return React.Children.map(childList, (child) =>
    insertSpace(child as React.ReactChild, needInserted),
  );
}

const ButtonTypes = tuple(
  'default',
  'primary',
  'ghost',
  'dashed',
  'danger',
  'link',
  'text',
  'secondary',
);
export type ButtonType = typeof ButtonTypes[number];
const ButtonShapes = tuple('default', 'circle', 'round');
export type ButtonShape = typeof ButtonShapes[number];
const ButtonHTMLTypes = tuple('submit', 'button', 'reset');
export type ButtonHtmlType = typeof ButtonHTMLTypes[number];

export interface BaseButtonProps {
  type?: ButtonType;
  icon?: React.ReactNode;
  /**
   * Shape of Button
   *
   * @default default
   */
  shape?: ButtonShape;
  size?: SizeType;
  loading?: boolean | { delay?: number };
  prefixCls?: string;
  ghost?: boolean;
  danger?: boolean;
  block?: boolean;
  children?: React.ReactNode;
}

export type AnchorButtonProps = {
  href: string;
  target?: string;
  onClick: React.MouseEventHandler<HTMLElement>;
} & BaseButtonProps &
  Omit<React.AnchorHTMLAttributes<any>, 'type' | 'onCLick'>;

export type NativeButtonProps = {
  htmlType?: ButtonHtmlType;
  onClick?: React.MouseEventHandler<HTMLElement>;
} & BaseButtonProps &
  Omit<React.ButtonHTMLAttributes<any>, 'type' | 'onCLick'>;

export type ButtonProps = Partial<AnchorButtonProps & NativeButtonProps>;

const InternalButton: React.ForwardRefRenderFunction<unknown, ButtonProps> = (props) => {
  const { children, prefixCls: defaultPrefixCls } = props;

  const size = React.useContext(SizeContext);

  const { getPrefixCls } = React.useContext(ConfigContext);

  const prefixCls = getPrefixCls('btn', defaultPrefixCls);

  const kids = spaceChildren(children, true);
  return <button>{kids}</button>;
};

const Button = InternalButton;
export default Button;
