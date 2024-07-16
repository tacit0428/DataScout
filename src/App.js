import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Mindmap from './components/Mindmap/Mindmap';
import HeaderBar from './components/Header/Header'; 
import ConfigWindow from './components/ConfigWindow';
import { Layout } from 'antd';
import './App.css';

const { Header, Content } = Layout;

function App() {
  const [visible, setVisible] = useState(false);
  const [showConfig, setShowConfig] = useState(false)

  const toggleDrawer = () => {
    setVisible(!visible);
  };

  const toggleConfig = () => {
    setShowConfig(true)
  }

  const closeConfig = () => {
    setShowConfig(false)
  }

  return (
    // <div className="App">
    //   <Header />
    //   <Sidebar visible={visible} toggleDrawer={toggleDrawer} />
    //   <Mindmap visible={visible} />
    //   <ConfigWindow />
    // </div>
    <Layout style={{height:"100vh"}}>
        <Header style={{ backgroundColor: '#fff', boxShadow: '0px 3px 10px 0px rgba(201, 201, 201, 0.5)', zIndex: 100}}>
          <HeaderBar/>
        </Header>
        <Content style={{display: 'flex', flexDirection: 'row', backgroundColor: '#fff'}}>
          <Sidebar visible={visible} toggleDrawer={toggleDrawer} />
          <Mindmap visible={visible} toggleConfig={toggleConfig} />
          {showConfig && <ConfigWindow closeConfig={closeConfig}/>}
        </Content>
    </Layout>
  );
}

export default App;
