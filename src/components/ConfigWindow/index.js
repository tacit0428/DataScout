import React, {useState, useRef, useEffect} from "react";
import { Rnd } from "react-rnd";
import { Button,  Collapse } from "antd";
import {
    MinusOutlined,
    CloseOutlined,
    PushpinOutlined,
    PushpinFilled,
    ArrowsAltOutlined,
    EditFilled,
    CaretRightOutlined
  } from '@ant-design/icons';
import QueryEditor from "./QueryEditor";
import RetrievedFacts from "./RetrievedFacts";
import './index.css'

import { useStore } from '../../store/store';
import { shallow } from 'zustand/shallow';

const selector = (store) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addChildNode: store.addChildNode,
  addRootNode: store.addRootNode,
  addEdge: store.addEdge,
  currentNode: store.currentNode,
  editorRef: store.editorRef
})

function ConfigWindow(props) {
    const store = useStore()
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFixed, setIsFixed] = useState(false); // 避免干扰文字选中操作
    const [pushpin, setPushpin] = useState(false)
    const [isRetrieving, setIsRetrieving] = useState(false)
    const [isRetrieved, setIsRetrieved] = useState(false) // 用于区分未检索状态和未检索到fact的状态
    const [size, setSize] = useState({ width: 400, height: '85%' });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const rndRef = useRef();

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
      };
    
    const handleFixToggle = () => {
        setPushpin(!pushpin)
    };


    useEffect(() => {
        if (rndRef.current && rndRef.current.getSelfElement()) {
            const initialRect = rndRef.current.getSelfElement().getBoundingClientRect();
            const documentWindow = rndRef.current.getSelfElement().ownerDocument.defaultView;

            const [initialX, initialY] = [initialRect.x, initialRect.y];
            const [elementWidth, elementHeight] = [initialRect.width, initialRect.height];
            const [viewportWidth, viewportHeight] = [documentWindow.innerWidth, documentWindow.innerHeight];

            let [newX, newY] = [initialX, initialY];
            newX = viewportWidth - elementWidth - initialX;
 
            setPosition({
                x: newX,
                y: newY
            });
        }
    }, []);

    const style = {
        display: "flex",
        // alignItems: "center",
        // justifyContent: "center",
        border: "1px solid rgba(225, 225, 225, 1)",
        borderRadius: '10px',
        overflow: 'hidden',
        zIndex: 100
    };


    const PanelHeader = ({title}) => {
        return (
            <div className="panel-header">
                <EditFilled style={{color: 'rgba(133, 140, 144, 1)'}}/>
                <div style={{marginLeft: '10px'}}>{title}</div>
            </div>
        )
    }

    const items = [ 
        {
            key: 0,
            label: <PanelHeader title='Query Editor' />,
            children: <QueryEditor setIsFixed={setIsFixed} setIsRetrieving={setIsRetrieving} setIsRetrieved={setIsRetrieved} />,
        },
        {
            key: 1,
            label: <PanelHeader title='Retrvieved Data Facts' />,
            children: <RetrievedFacts setIsFixed={setIsFixed} isRetrieving={isRetrieving} isRetrieved={isRetrieved} />,
        }
]

    return (
        <Rnd
            style={style}
            minWidth={300}
            size={isMinimized ? { width: 300, height: 45 } : size}
            position={position}
            onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
            onResizeStop={(e, direction, ref, delta, position) => {
              setSize({
                width: ref.style.width,
                height: ref.style.height,
              });
              setPosition(position);
            }}
            enableResizing={!isMinimized}
            disableDragging={isFixed || pushpin}
            bounds="parent"
            ref={rndRef}
        >
            <div className="window">
                <div className="window-header">
                    <div className="window-name">Retrieval Details</div>
                    <div className="window-btn-group">
                        <Button type="text" shape="circle" icon={isMinimized? <ArrowsAltOutlined /> : <MinusOutlined />} onClick={handleMinimize}></Button>
                        <Button type="text" shape="circle" icon={pushpin? <PushpinFilled /> : <PushpinOutlined />} onClick={handleFixToggle}></Button>
                        <Button type="text" shape="circle" icon={<CloseOutlined />} onClick={()=>{store.setShowConfig(false)}}></Button>
                    </div>
                </div>
                {!isMinimized && (
                    <div className="window-content">
                        {/* <QueryEditor setIsFixed={setIsFixed}/>
                        <RetrievedFacts /> */}
                        <Collapse 
                            className="window-collapse"
                            items={items} 
                            bordered={false}
                            defaultActiveKey={['0', '1']} 
                            ghost={true}
                            expandIconPosition={'end'}
                            expandIcon={({ isActive }) => <div className="expand-icon"><CaretRightOutlined rotate={isActive ? 90 : 180} style={{color: '#B2B2B2'}}/></div>}
                        />
                    </div>
                )}
            </div>
        </Rnd>
    )
}

export default ConfigWindow