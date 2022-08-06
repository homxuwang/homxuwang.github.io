---
title: react-transition-group结合多个styled-components组件动画不生效的问题
date: 2021-02-04 14:47:40
tags: [react]
---
# 问题描述

## 问题相关环境
```
"react": "^16.13.1",
"react-transition-group": "^4.4.1",
"styled-components": "^5.2.0"
```

## 需求描述

创建sidebar，点击控制按钮时，显示侧边栏的各个Item。但是没有动画，组件的显示与关闭都是瞬间完成，这样看起来很突兀，所以想给元素enter和exit的时候加一个过渡动画。

## 问题复现

### index.js
```js
import React,{ Component } from 'react'
import { CSSTransition,TransitionGroup } from 'react-transition-group'
import { connect } from 'react-redux'
import { actionCreators } from './store'

import { 
    SideBarLeftWrapper,
    SideBarLeftBtn,
    SideBarMenu,
    SideBarMenuItem
 } from './style'


import menuItemsJson from '../../static/json/sideBar.config.json'
  
class SideBar extends Component {

    constructor(props){
      super(props)
      this.getMenuItems = this.getMenuItems.bind(this)
    }

    getMenuItems = () => {
        const {isShowMenu} = this.props
        return(
          <TransitionGroup>
            {
              menuItemsJson.map( (item,index) => (
                // isShowmenu控制某些css元素的显示与否
                <CSSTransition
                  in={isShowMenu}
                  timeout={200}
                  classNames='slide'
                  unmountOnExit
                >
                  <SideBarMenuItem>
                      <span className='iconfont' dangerouslySetInnerHTML={{ __html: item.name}}/>
                  </SideBarMenuItem>
                </CSSTransition>
              ) )
            }
            
          </TransitionGroup>
        ) 
    }

    
    render() {
        const {handleMenuBtnClick,isShowMenu} = this.props
        return (
            <SideBarLeftWrapper isShowMenu={isShowMenu}>
                <SideBarLeftBtn isShowMenu={isShowMenu} onClick={() => {handleMenuBtnClick(isShowMenu)}}>
                    <span
                        className="iconfont menu-btn"
                    >&#xe7f2;</span>
                </SideBarLeftBtn>
                  { this.getMenuItems() }
            </SideBarLeftWrapper>
            
        )
    }

     
}



const mapStateToProps = (state) => {
    return ({
        isShowMenu: state.getIn(['sidebar','isShowMenu'])
    })
}

const mapStateToDispatch = (dispatch) => {
    return {
        handleMenuBtnClick: (isShowMenu) => {
            dispatch(actionCreators.menuFocus(isShowMenu))
        }
    }
}

export default connect(mapStateToProps,mapStateToDispatch)(SideBar);
```

### style.js
```js
import styled from 'styled-components'

export const SideBarLeftWrapper = styled.div`
  width: ${props => (props.isShowMenu ? '130px' : '0')};
  height: 96%;
  margin: 10px 0 0 10px;
  float: left;
  z-index: 100;
  position: absolute;
  transition: all 0.5s;
  -moz-transition: width 0.5;
`

export const SideBarLeftBtn = styled.div`
  width: 20px;
  height: 20px;  
  background: rgba(246,246,246,0.2);
  z-index: 999;
  margin: 5px 10px 10px 10px;
  margin-left: ${props => props.isShowMenu ? '100px' : '5px'};
  transform: ${props => props.isShowMenu ? 'rotate(450deg)' : 'rotate(0deg)'};
  transition: all 1s;
  cursor: pointer;
  .menu-btn{
    font-size: 25px;
    color: white;
  }
  /* &:hover{
    transform:scale(1.3);
    -ms-transform:scale(1.3); 	
    -moz-transform:scale(1.3); 	
    -webkit-transform:scale(1.3); 
    -o-transform:scale(1.3); 	
  } */
`

export const SideBarMenu = styled.div`
  width: 98%;
  height: 90%;
`

export const SideBarMenuItem = styled.button`
	float: left;
	margin: 5px;
	padding: 0;
	border: 3px solid;
	background: none; 
	color: #a8d8ea;
	vertical-align: middle;
  overflow: hidden;
	position: relative;
	z-index: 1;
  -webkit-transition: all 1s;
	transition: all 1s;
  border-radius: 15px;
  font-weight: 500;
  min-width: 120px;
  max-width: 200px;
  letter-spacing: 2px;
  font-size: 14px;
  &:focus {
    outline: 0;
  }
   > span {
    display: block;
  }
 
  &:after {
    color: #fff;
  }
  
  :hover {
    border-color: #3f51b5;
    background-color: rgba(63, 81, 181, 0.1);
  }
  &:hover {
    border-color: #fff;
    background-color: #21333C;
  }
  &::after {
    opacity: 1;
    color: #fff;
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
  &:hover > span {
    opacity: 1;
    color: #fff;
    border: 3px #ffffff;
  }
  &.slide-enter {
      opacity:0;
  }
  &.slide-enter-active {
      opacity: 1;
      transition: all .5s ease-in;
  }
  &.slide-exit {
      opacity: 1;
  }
  &.slide-exit-active {
    opacity: 0;
    transition: all .5s ease-in;
  }
`
```

最外层`SideBarLeftWrapper`为侧边栏容器div，`SideBarLeftBtn`为列表显示/关闭的空值按钮，点击时改变**isShowMenu**的值，**isShowMenu**变量空值列表元素的显示与否。`SideBarMenu`为侧边栏各元素的父元素，`SideBarMenuItem`为具体的每个侧边栏按钮元素，也就是要添加动画的对象。

在实践过程中，`SideBarMenuItem`元素从json文件中读取，使用map方法循环遍历后返回该元素，如果要为每个元素添加动画，那么要将`CSSTransition`标签包裹在**每个**元素外面，而且其里面只能有**一个**直接元素，也就是子元素（孙子元素管不着）：
```js
 menuItemsJson.map( (item,index) => (
    // isShowmenu控制某些css元素的显示与否
    <CSSTransition
      in={isShowMenu}
      timeout={200}
      classNames='slide'
      unmountOnExit
    >
      <SideBarMenuItem>
          <span className='iconfont' dangerouslySetInnerHTML={{ __html: item.name}}/>
      </SideBarMenuItem>
    </CSSTransition>
  ) )
```

由于之前在学习React的时候，看到当时的代码，多个`CSSTransition`标签外面要用`TransitionGroup`标签包裹起来，而我加上它以后有，反而没有动画


![image](https://raw.githubusercontent.com/homxuwang/homxuwang.github.io/jekyll/images/react-transition-group结合多个styled-components组件动画不生效的问题/1.gif)

而当去除了`TransitionGroup`父元素后，动画则生效了

```js
getMenuItems = () => {
    const {isShowMenu} = this.props
    return(
          menuItemsJson.map( (item,index) => (
            // isShowmenu控制某些css元素的显示与否
            <CSSTransition
              in={isShowMenu}
              timeout={200}
              classNames='slide'
              unmountOnExit
            >
              <SideBarMenuItem>
                  <span className='iconfont' dangerouslySetInnerHTML={{ __html: item.name}}/>
              </SideBarMenuItem>
            </CSSTransition>
          ) )
    ) 
    }
```

![image](https://raw.githubusercontent.com/homxuwang/homxuwang.github.io/jekyll/images/react-transition-group结合多个styled-components组件动画不生效的问题/2.gif)

之前在学习完react后，就没有进行实践和练习，这次算是回顾+学习，遇到这个问题也是琢磨了很久，但是至于原因目前还没有摸清楚。

补充： 官网使用的<TransitionGroup>和<CSSTransition>标签搭配，见：https://reactcommunity.org/react-transition-group/transition-group