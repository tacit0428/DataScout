// import React, { useState } from 'react';
// import Sidebar from './components/Sidebar/Sidebar';
// import Mindmap from './components/Mindmap/Mindmap';
// import HeaderBar from './components/Header/Header'; 
// import ConfigWindow from './components/ConfigWindow';
// import { Layout } from 'antd';
// import { useStore } from './store/store';
// import { ReactFlowProvider } from 'reactflow';
// import './App.css';

// const { Header, Content } = Layout;

// function App() {
//   const store = useStore()
//   const [visible, setVisible] = useState(false);

//   const toggleDrawer = () => {
//     setVisible(!visible);
//   };

//   return (
//     <ReactFlowProvider>
//       <Layout style={{height:"100vh"}}>
//           <Header style={{ backgroundColor: '#fff', boxShadow: '0px 3px 10px 0px rgba(201, 201, 201, 0.5)', zIndex: 100}}>
//             <HeaderBar/>
//           </Header>
//           <Content style={{display: 'flex', flexDirection: 'row', backgroundColor: '#fff'}}>
//             <Sidebar visible={visible} toggleDrawer={toggleDrawer} />
//             <Mindmap visible={visible} />
//             {store.showConfig && <ConfigWindow />}
//           </Content>
//       </Layout>
//     </ReactFlowProvider>
//   )
// }

// export default App;

import { HashRouter as Router, Route, Routes, Switch } from 'react-router-dom';
import HomePage from './pages/HomePage';
import PublishPage from './pages/PublishPage';

const App = () => {


  return (
      <Router>
          <Routes>
              <Route path="/home" element={<HomePage />} />
              <Route path="/news/*" element={<PublishPage />} />
          </Routes>
      </Router>
  );
};

export default App;
