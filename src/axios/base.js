import axios from 'axios';
import { stringify } from 'query-string';
import config from './config';
import Cookies from 'js-cookie';

const composeUrl = function (url, qs) {
    let result = '';
    // if (url[0] !== '/') {
    //   result += '/';
    // }
    result += url;
    if (typeof qs === 'object' && Object.keys(qs).length !== 0) {
        result += `?${stringify(qs)}`;
    }
    return result;
};

export const request = ({ url, method, param, data }) => {
    if (Cookies.get('userInfo')) {
        // console.log("token", JSON.parse(Cookies.get('userInfo')), JSON.parse(Cookies.get('userInfo')).token)
    }
    return new Promise((reslove, reject) => {
        axios({
            method: method,
            url: composeUrl(url, param),
            data: data,
            withCredentials: true,
            headers: { 'token': Cookies.get('userInfo') ? JSON.parse(Cookies.get('userInfo')).token : null },
        }).then((response) => {
            if (response.status >= 400) {
                reject();
            } else if (response.status === 200 || response.status === 201 || response.status === 204) {
                reslove(response.data);
            } else {
                reject();
            }
        }).catch(error => {
            if (error.response) {
                if (error.response.status === 401) {
                    //reject('401');
                    reject()
                    //退出登陆
                    axios({
                        method: "post",
                        url: `${config.url.logout}`,
                        data: {},
                        withCredentials: true
                    }).then((response) => {
                        if (response.status === 200) {
                            window.location.href = config.url.loginRedirectUrl //login first
                        }
                    }).catch(
                    )
                }
            }
            reject();
        })
    })
};

export const requestWithoutCredentials = ({ url, method, param, data }) => {
    return new Promise((reslove, reject) => {
        axios({
            method: method,
            url: composeUrl(url, param),
            data: data
        }).then((response) => {
            if (response.status >= 400) {
                reject();
            } else if (response.status === 200 || response.status === 201 || response.status === 204) {
                reslove(response.data);
            } else {
                reject();
            }
        }).catch(error => {
            reject();
            //  message.error('error message');
        })
    })
};

