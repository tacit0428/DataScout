import React from 'react';
import './Header.css'; // 引入导航栏的样式
import logo from '../../assets/2023.svg'; // 导入 SVG 文件

const HeaderBar = () => {
  return (
    <div className="header">
      <div className="logo">
      <img src={logo} alt="Logo" />
        <div className="logo-text">Search Platform</div>
      </div>
    </div>
  );
};

export default HeaderBar;
