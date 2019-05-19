我们从todolist开始，揭开后台开发的神秘面纱，让你知道后端开发其实也不困难，克服心理障碍，成为一名全栈开发工程师。

我们打算步步为营，从零开始逐渐完善整个项目代码
1. 第一步，先实现一个最简化的纯静态版本的todolist
2. 第二步，建立后台接口，用mock测试数据填充，让页面先能够正常显示出来
3. 第三步，设计数据库，将测试数据改为真正的接口

其实这也是真实项目的开发流程，现在的前后台开发都是分离的，前后台开发先按照接口约定各自定代码，前端用静态数据模拟（mock)能够完成99%以上的功能开发，后端接口开发完毕之后对接。


# 前端纯静态版todolist
为了保持教程的简单，我们前端代码用jquery实现，建立一个index.html的空白文件，在页面引入jquery，并添加 ul元素(id=list)做为容器。
todolist的数据先用静态的数组定义，每条记录有id,title,status 三个属性（字段），分别表示事项的编号、标题、是否已完成。
html字符串的拼接用了ES6的模板字符串，因为支持换行模板字符串，方便书写和演示。

代码如下：
```js
function render(){
    
        var html="";
        var result=[
        {id:1,title:"hello",status:0},
        {id:2,title:"hello",status:0}
        ];
        result.forEach(function(item){
            var checked=item.status>0?"checked":"";
            var li=`<li itemId="${item.id}">
                <input name="chk" type="checkbox" ${checked}>
            <input type="textbox" value="${item.title}">
            <span><a href="javascript:" id="btn_save">保存</a>
            <a href="javascript:"  id="btn_delete">删除</a>
            </span>
            </li>`
            html+=li;
        })

        $("#list").html(html);
       
    
}
$(function (){
    render();
})
```

运行 index.html,显示效果：
![](https://user-gold-cdn.xitu.io/2019/5/20/16ad1383c3c59533?w=292&h=68&f=png&s=2937)
# 第一次迭代，用mock数据，连接真实的后台接口
好了，静态页面渲染已经写好，要迈出后台开发的第一步了，把静态数据改成调用ajax 接口，对render函数稍做改造即可

```js
function render(){
    $.post("http://localhost/todo/list",{},function (result){
        var html="";
        result.forEach(function(item){
            var checked=item.status>0?"checked":"";
            var li=`<li itemId="${item.id}">
                <input name="chk" type="checkbox" ${checked}>
            <input type="textbox" value="${item.title}">
            <span><a href="javascript:" id="btn_save">保存</a>
            <a href="javascript:"  id="btn_delete">删除</a>
            </span>
            </li>`
            html+=li;
        })

        $("#list").html(html);
       
    });
}
```
但是问题是现在还没有后台服务器，而且本地的html文件发送ajax请求会遭遇跨域错误，如下：

![](https://user-gold-cdn.xitu.io/2019/5/20/16ad141f77ac75f0?w=985&h=25&f=png&s=6072)

这个其实是有办法解决的，只要后台接口实现了cors跨域，就可以调通了。先来搭建http服务，我们今天不用express，也不用koa，因为他们都没有mock功能，跨域也要额外编写很多代码。因此我自己封装了一个，名为webcontext，github地址：
[https://github.com/windyfancy/webcontext](https://github.com/windyfancy/webcontext)

通过npm可以安装，我们在硬盘上建个目录，例如todo_sample，用于存放后台项目，切换进入该文件夹，运行npm install安装

```
npm install --save webcontext
```
安装好之后，在项目根目录建一个app.js,用于启动http服务，写两行代码：

app.js
```js
const WebContext = require('webcontext');
const app = new WebContext();
```
运行node app.js，然后访问http://localhost/，能够输出hello信息，表示http服务已经搭建成功！
然后在项目根目录/service目录中建立一个todo子目录，将在todo目录中建立一个list.ejs空白文件,目录结构如下
```
|-- service                          
|     |--todo
|         |--list.ejs
```

把之前的静态数据存入list.ejs中

···
[
    {id:1,title:"hello",status:0},
    {id:2,title:"hello",status:0}
]
···
现在再来用浏览器直接访问：http://localhost/todo/list ，已经可以直接输了该文件的内容了，但是用本地的index.html调用这个接口仍然是返回跨域错误的，为了安全考虑， webcontext 跨域的配置默认是关闭的，我们打开项目根目录的web.config.json(首次运行时会自动生成)，修改cors属性中的allowOrigin字段值为*即可开启跨域，不需要添加任何代码。
```js
"cors":{
        "allowOrigin":"*"
    }
```

# 第二次迭代，设计mysql数据库，为改用真实数据做准备
安装mysql，用自带的workbench连接数据，新建一个库（schema），并新建一个表

```
CREATE TABLE `todo_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(45) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
)
```

注：MySQL8.0以上版本密码认证协议发生了改变，需要用mysql workbench执行如下代码才能使用node.js连接数据库，sql代码如下： ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '你的密码';

修改web.config.json，设置数据库连接参数

```
"database":{ 
        "host":"127.0.0.1",
        "port":"3306",
        "user":"root",
        "password":"你的密码",
        "database":"库名称"
    } 
```
好了，现在重启一下node app.js，应该可以连接数据库了


# 第三次迭代，编写数据库查询保存接口，实现CURD

## select 
/service/todo/list.js
```js
module.exports= {
    async onLoad() {
        var result=await this.database.select("todo_list")
        this.render(result); 
    }
}
```
## insert 
/service/todo/add.js
```js
module.exports= {
    async onLoad() {
        await this.database.insert("todo_list",{  title:this.request.data["title"],status:0});
        this.render({code:"OK"})
    }
}
```
## update
/service/todo/update.js
```js
module.exports= {
    async onLoad() {
        await this.database.update("todo_list",this.request.data)
        this.render({code:"OK"})
    }
}
```
## delete 
/service/todo/delete.js
```js
module.exports= {
    async onLoad() {
        await this.database.delete("todo_list",{ id:this.request.data["id"]})
        this.render({code:"OK"})
    }
}
```

# 第四次迭代，增加前端的添加，保存和删除逻辑,样式美化

```js
$("#btn_add").click("click",function (e){
    $.post("/todo/add",{title:$("#title").val()},function (res){
        if(res.code="OK"){
            render();
        }
        
    });
})
$("#list").click("click",function (e){
    if(e.target.id=="btn_save" || e.target.name=="chk"){
        var li=$(e.target).parents("li");
        var id=li.attr("itemId")
        var title=li.find("input[type=textbox]").val();
        var status=li.find("input[type=checkbox]").prop("checked")?1:0;
        $.post("/todo/update",{id:id,title:title,status:status},function (res){
            if(res.code="OK"){
                render();
            }
        });
    }else if(e.target.id=="btn_delete"){
        var id=$(e.target).parents("li").attr("itemId")
        $.post("/todo/delete",{id:id},function (res){
            if(res.code="OK"){
                render();
            }
        });
    }

})
```

# 第五次迭代 ，静态文件迁移到http服务器，完工