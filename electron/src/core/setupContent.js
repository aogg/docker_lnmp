
const commonFunc = require('./commonFunc');
const electron = window.require('electron');

let containerList = Symbol('containerList');



let setupConfig = {
    'default': [
        {
            name: '点击主窗口关闭时',
            type: 'select',
            data: ['隐藏', '关闭'],
            selected: localStorage.getItem('windowClose'),
            // json-data
            change: {
                name: 'windowClose',
            },
        },
        {
            name: '标题',
            type: 'text',
            get data(){
                return electron.remote.getGlobal('config').title;
            },
            change:{
                action: 'nodeStorage',
                name: 'app-title',
                proto: '.',
            },
        },
        {type: 'space',},
        {
            type: 'containerConfig',
        },
    ],
    [containerList]: [
        {
            type: 'containerConfig',
            childConfig:{
                'php':{
                    'compose_build_php_processes_num':{
                        inputType: 'number',
                    }
                },
                'nginx': {
                    'compose_build_nginx_args': {
                        type: 'textarea',
                    }
                }
            }
        },
    ]
};








function renderHtml(config, containerData, name) {
    if (typeof config !== 'object') {
        return '';
    }

    let html = '';
    config.map(function (val, index) {
        if (typeof val === 'object') {

            html += renderTypeHtml(val, containerData, name);

        }
    });

    return html;
}


function renderContainerHtml(config, containerData, name) {
    let html = '';
    config.map(function(val, index){
        if (typeof val === 'object') {

            html += renderTypeHtml(val, containerData, name);

        }
    });

    return html;
}


/**
 *
 * @param data
 * @param {object} containerData
 * @param {string} name
 * @returns {string}
 */
function renderTypeHtml(data, containerData, name) {
    if (!data.type) {
        return '';
    }
    let templateFunc = function (content, attrClass = '', attrHtml = '') {
        return `
                <div class="content-once">
                    <div class="content-name">${data.name}</div>
                    <div class="content-data ${attrClass}" ${attrHtml} >${content}</div>
                </div>
        `;
    };
    let html = '';
    data.change = data.change ? JSON.stringify(data.change) : '';

    switch (data.type) {
        case 'containerConfig':
            let childConfig = commonFunc.getObjectProto(data, `childConfig.${name}`, {});
            for (let key in containerData) {
                if (typeof containerData[key] !== 'object'){
                    html += renderTypeHtml(Object.assign({
                        type: 'text',
                        name: key,
                        data: containerData[key],
                        change: {
                            name: key,
                            containerConfig: true,
                        },
                    }, childConfig[key] || {}));
                }
            }
            childConfig = null;
            break;
        case 'select':
            if (Array.isArray(data.data)) {
                html += `<select @change="this.$parent.selectEnv" data-change='${data.change}' >`;
                for (let key in data.data){
                    let selected = data.selected == key?'selected="true"':'';
                    html += `<option ${selected} value="${key}">${data.data[key]}</option>`;
                }
                html += '</select>';
                html = templateFunc(html, 'render-select', ``);
            }

            break;

        case 'space':
            html = '<div class="content-once content-space"></div>';
            break;
        case 'textarea':
            html = templateFunc(`<textarea data-change='${data.change}'  @change="this.$parent.textareaEnv" >${data.data}</textarea>`,
                'render-textarea');
            break;
        case 'text':
        default: // text
            let inputType = data.inputType ? data.inputType : 'text';
            html = templateFunc(`
                <input type="${inputType}" data-change='${data.change}' @change="this.$parent.textEnv" value="${commonFunc.html2Escape(data.data)}" />
            `, 'render-text');
            break;
    }

    return html;
}


function common(containerData) {
    let name = this.name;

    if (!name) {
        return;
    }

    if (this.componentsBool[name]){
        this.setContentHtml();
        return;
    }

    let template = '';


    if (this.ifDefault) { // 集合 default
        this.$root.containers.map((val) => Reflect.deleteProperty(containerData, val)); // 删除其他容器配置
        template = renderHtml(setupConfig[name], containerData, name);
    } else if (this.$root.containers.includes(name)) { // containerList
        template = renderContainerHtml(setupConfig[containerList], containerData[name], name);
    } else { // $root.containers还未赋值
        this.$root.$watch('containers', () => {
            template = renderContainerHtml(setupConfig[containerList], containerData[name], name);

            template = '<div class="setup-content-main setup-content-bg">' + template + '</div>';
            this.setContentHtml(template);
        });
        return;
    }

    template = '<div class="setup-content-main setup-content-bg">' + template + '</div>';
    this.setContentHtml(template);
}


module.exports = function (vue, containerData) {
    Reflect.apply(common, vue, [containerData]);
};




// module.exports = function (vue, name, containerMap = []) {
//     if (Reflect.has(setupConfig, name)) { // 存在
//         renderHtml(setupConfig[name]);
//     } else if (Array.isArray(containerMap)) { // 容器列表
//         containerList();
//     } else { // 查询

//     }
// };


