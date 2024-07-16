import React, {useState, useRef, useEffect} from "react";
import { Rnd } from "react-rnd";
import { Button } from "antd";
import {
    MinusOutlined,
    CloseOutlined,
    PushpinOutlined,
    PushpinFilled,
    ArrowsAltOutlined
  } from '@ant-design/icons';
import QueryEditor from "./QueryEditor";
import RetrievedFacts from "./RetrievedFacts";
import './index.css'

function ConfigWindow(props) {
    const [isMinimized, setIsMinimized] = useState(false);
    const [isFixed, setIsFixed] = useState(false);
    const [size, setSize] = useState({ width: 420, height: '85%' });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const rndRef = useRef();

    const handleMinimize = () => {
        setIsMinimized(!isMinimized);
      };
    
    const handleFixToggle = () => {
        setIsFixed(!isFixed);
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
            disableDragging={isFixed}
            bounds="parent"
            ref={rndRef}
        >
            <div className="window">
                <div className="window-header">
                    <div className="window-name">Retrieval Details</div>
                    <div className="window-btn-group">
                        <Button type="text" shape="circle" icon={isMinimized? <ArrowsAltOutlined /> : <MinusOutlined />} onClick={handleMinimize}></Button>
                        <Button type="text" shape="circle" icon={isFixed? <PushpinFilled /> : <PushpinOutlined />} onClick={handleFixToggle}></Button>
                        <Button type="text" shape="circle" icon={<CloseOutlined />} onClick={props.closeConfig}></Button>
                    </div>
                </div>
                {!isMinimized && (
                    <div className="window-content">
                        <QueryEditor />
                        <RetrievedFacts />
                    </div>
                )}
            </div>
        </Rnd>
    )
}

export default ConfigWindow