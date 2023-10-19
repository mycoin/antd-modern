import React from 'react'
import RenderHook, { RenderHookProps } from '../RenderHook'
import showConfirm from './showConfirm'
import toPromise from './toPromise'
import showMessage from './showMessage'
import { RenderHookHandler, SimpleModalProps } from '../interfaces'

type ShowModalParam<T> = Omit<SimpleModalProps, 'content' | 'onOk' | 'onCancel'> & {
  // 渲染主体的方法
  contentRender: RenderHookProps<T>['contentRender']
  // 点击提交按钮
  onOk: (value: T) => Promise<void> | void
  // 点击取消按钮
  onCancel?: () => Promise<void> | void
}

export default <T extends {}>(current: T, props: ShowModalParam<T>) => {
  const { contentRender, onOk, onCancel, afterClose, ...restProps } = props
  const handler: RenderHookHandler<T> = {
    current,
  }
  const toExecute = (method: any, args?: any, sm?: boolean) => {
    if (typeof method === 'function') {
      const returnResult = toPromise(method(args) || true)
      if (sm) {
        returnResult.catch((error) => {
          if (error && typeof error.message === 'string') {
            showMessage({
              type: 'error',
              content: error.message,
            })
          }
        })
      }
      return returnResult
    } else {
      return toPromise(true)
    }
  }

  let isClose = false
  const hook = showConfirm({
    ...restProps,
    icon: null,
    content: (
      <RenderHook
        contentRender={contentRender}
        value={current}
        handler={handler}
      />
    ),
    onOk: () => toExecute(onOk, handler.current, true),
    onCancel: (handleNext: any) => {
      if (isClose === true) {
        // 如果通过点击关闭按钮则无需二次确认
        handleNext()
      } else {
        toExecute(onCancel).then(() => {
          handleNext()
        })
      }
    },
    afterClose: () => {
      isClose = true
      if (typeof afterClose === 'function') {
        afterClose()
      }
    },
  })
  // 如下两个函数供渲染表单方法使用
  handler.onCancel = () => {
    toExecute(onCancel).then(hook.destroy)
  }
  handler.onOk = () => {
    toExecute(onOk, handler.current, true).then(hook.destroy)
  }
  return hook
}

export { ShowModalParam }
