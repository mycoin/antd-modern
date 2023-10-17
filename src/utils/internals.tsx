import { CSSProperties } from 'react'
import { ModalFuncProps } from 'antd'
import toReactNode from './toReactNode'

type MessageData = {
  messageId?: string
  [prop: string]: any
}

type SimpleModalProps = ModalFuncProps & {
  modalSize?: 'small' | 'medium' | 'large'
  locale?: {
    ok: string
    cancel?: string
  }
}

type WindowHandler = {
  target?: HTMLIFrameElement
  postMessage: (message: any, targetOrigin?: string) => void
  write: (html: string) => boolean
  hideModal: () => void
}

type BaseEmbedWindowParam = {
  messageId?: string
  onMessage?: (handle: WindowHandler, data: MessageData) => void
  onRender?: (handle: WindowHandler) => void
  afterClose?: () => void
}

const styleMapper: Record<string, CSSProperties> = {
  small: {
    maxWidth: 540,
    minWidth: 380,
  },
  medium: {
    maxWidth: 700,
    minWidth: 540,
  },
  large: {
    maxWidth: 1190,
    minWidth: 700,
  },
}

const normalize = (param: SimpleModalProps): SimpleModalProps => {
  const { modalSize, style, locale, title, content, ...restProps } = {
    title: '温馨提示',
    keyboard: false,
    maskClosable: false,
    modalSize: 'small',
    locale: {
      ok: '确认',
      cancel: '取消',
    },
    // 默认不展示关闭入口（防止误操作）
    closable: false,
    // 销毁对象减少内存溢出风险
    destroyOnClose: true,
    // 强制渲染
    forceRender: true,
    ...param,
  }
  return {
    title: toReactNode(title),
    content: toReactNode(content),
    width: 'fit-content',
    okText: locale.ok,
    cancelText: locale.cancel,
    style: {
      ...styleMapper[modalSize],
      ...style,
    },
    ...restProps,
  }
}

export { normalize }
export { MessageData, WindowHandler, BaseEmbedWindowParam, SimpleModalProps }
