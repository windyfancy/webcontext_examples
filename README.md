我们从todolist开始，揭开后台开发的神秘面纱，让你知道后端开发其实也不困难，克服心理障碍，成为一名全栈开发工程师。

我们打算步步为营，从零开始逐渐完善整个项目代码
1. 第一步，先实现一个最简化的纯静态版本的todolist
2. 第二步，建立后台接口，用mock测试数据填充，让页面先能够正常显示出来
3. 第三步，设计数据库，将测试数据改为真正的接口

其实这也是真实项目的开发流程，现在的前后台开发都是分离的，前后台开发先按照接口约定各自定代码，前端用静态数据模拟（mock)能够完成99%以上的功能开发，后端接口开发完毕之后对接。


# 前端纯静态版todolist
为了保持教程的简单，前端代码用jquery实现，建立一个index.html的空白文件，在页面引入jquery，并添加一个ul元素 做为容器。加一个文本框和添加按钮，html代码如下：
```html
<ul id="list"></ul>
<input type="text" id="title" placeholder="输入待办事项">
<button id="btn_add">添加</button>
```
现在还没有后台数据库，数据只能先用静态的数组定义，每条记录有id,title,status 三个属性（字段），分别表示事项的编号、标题、是否已完成。
我们用测试数据定义一个数组，然后用forEach循环，用html字符串进行拼接，最后合并html生成dom，该示例用了ES6的模板字符串，方便书写和演示。

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
                <input type="checkbox" ${checked}>
                <input type="textbox" value="${item.title}">
                <a href="javascript:"  class="delete">删除</a>
            </li>`
            html+=li;
        })
        $("#list").html(html);
    });
}
```
但是问题是现在还没有后台服务器，而且本地的html文件发送ajax请求会遭遇跨域错误，有在本地做过开发的同学一定知道ajax会产生cors异常，因为本地的文件是用file://协议打开的，如果访问http://协议的页面，会因为同源策略导致跨域错误，同源策略要求：
1. 协议相同
2. 域名相同
3. 端口相同

控制台的报错信息如下图所示：

![](https://user-gold-cdn.xitu.io/2019/5/20/16ad141f77ac75f0?w=985&h=25&f=png&s=6072)

这个问题其实是有办法解决的，只要后台接口实现了cors跨域，就可以畅通无阻的调用了，这样你的代码不用部署到远程服务器，就可以调用远程服务器的接口，非常的方便。那么先来搭建个http服务实现cors吧，少年！我们今天不用express，也不用koa，因为他们都没有mock功能，跨域也要额外编写很多代码。因此我自己封装了一个，名为webcontext，github地址：
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
运行node app.js，http服务就启动了，然后访问http://localhost/，能够输出hello信息，表示http服务已经搭建成功！

接下来，在项目根目录/service目录中建立一个todo子目录，将在todo目录中建立一个list.ejs空白文件,目录结构如下
```
|-- service                          
|     |--todo
|         |--list.ejs
```

把之前的静态数据存入list.ejs中,它其实是个ejs模板文件，当然也可以存放json

```
[
    {id:1,title:"hello",status:0},
    {id:2,title:"hello",status:0}
]
```
现在再来用浏览器直接访问：http://localhost/todo/list ，已经可以直接输了该文件的内容了，但是用本地的index.html调用这个接口仍然是返回跨域错误的，为了安全考虑， webcontext 跨域的配置默认是关闭的，我们打开项目根目录的web.config.json(首次运行时会自动生成)，修改cors属性中的allowOrigin字段值为*即可开启跨域
```js
"cors":{
        "allowOrigin":"*"
    }
```
现在再来访问本地的index.html，发现已经可以请求成功了，http 响应头正确的输出了cors 跨域的信息。

![](https://user-gold-cdn.xitu.io/2019/5/20/16ad5d2ade294062?w=446&h=354&f=png&s=28042)

# 第二次迭代，设计mysql数据库，为改用真实数据做准备
上一步完成了后台http接口的搭建，用mock静态数据验证了todolist的加载功能正常。终于到了激动人心的数据库开发环节了，想想马上就可以做个高大上的CURD boy了，走上人生巅峰，出任CEO，心情真是有点小激动呢。

简单了解一下吧，顾名思义，数据库是用来存放数据的地方，目前主流的数据库是关系数据库，如mysql、oracle、sql server等，以行列结构存储一张张表的数据，就如同一个excel表格，每一张表是一个独立的sheet，我们把刚才静态的json数据转换成表的形式如下：

|  id    | title | status|
|  ----  | ----  | ----- |
| 1      | hello |   0   |
| 2      | world |   0   |

以mysql为例，来定义一下这张todo_list表的结构，共有3个字段：
* id：表示待办事项的编号，数值类型，在数据库中以int类型表示，它是每条记录的唯一标识，即主键
* title:表示待办事项的名称，字符串类型，在数据库中以varchar变长字符串类型表示
* status:表示待办事项的状态，布尔类型，为了便于扩展我们定义成数据类型，也用int类型表示

我们来建表吧，首先肯定要安装mysql了

上官方网站https://www.mysql.com/downloads/ 下载安装一下，完整安装一下。装 好之后，就 可以用用自带的workbench连接数据库了。用你刚才安装时初始设定的密码连接一下：


![](https://user-gold-cdn.xitu.io/2019/5/20/16ad5dae44acf6ca?w=761&h=267&f=png&s=35279)


连接上之后，数据库还是空的呢，要先新建一个数据库（schema），名称为todo_db，然后在这个数据库中新建一个表，可以用工具栏或菜单中的create new table快速创建一张表：


![](https://user-gold-cdn.xitu.io/2019/5/20/16ad32596f0d9659?w=880&h=482&f=png&s=35989)

当然也可以用sql代码去创建表：
```
CREATE TABLE `todo_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(45) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
)
```

创建好数据库表之后，我们尝试用代码连接数据库，webcontext框架已经集成了数据库的连接，只需要配置一下，在app.js启动时就可以自动连接数据库了，不用编写任何额外的代码

修改web.config.json，设置数据库连接参数

```
"database":{ 
        "host":"127.0.0.1",
        "port":"3306",
        "user":"root",
        "password":"你的密码",
        "database":"todo_db"
    } 
```
注：MySQL8.0以上版本密码认证协议发生了改变，需要用mysql workbench执行如下代码才能使用node.js连接数据库，sql代码如下： ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '你的密码';

好了，现在重新运行一下node app.js，就可以自动连接数据库了


# 第三次迭代，编写数据库查询保存接口，实现CURD

数据库连接成功后，我们要测试一下，能否正常查询和写入数据，因为现在数据库还是空的，我们先从插入数据开始。
## 什么是CURD?
它代表数据库的 创建（Create）、更新（Update）、读取（Retrieve）和删除（Delete） 4个基本操作。对于关系型数据库，可以通过sql (结构化查询语言 Structured Query Language 简称SQL) 来编写代码支持这4个基本操作，分别对应insert,update,select,delete  4条语句。

webcontext已经对insert,update,select,delete进行了封装，因此对于简单的读写操作，不需要编写原始的sql语句了。

## insert 
在项目目录创建一个js文件，/service/todo/add.js ，并编写代码：
```js
module.exports= {
    async onLoad() {
        await this.database.insert("todo_list",{  title:"hello",status:0});
        this.render({code:"OK"})
    }
}
```
只有4行代码， 我们来逐行解释一下
1. module.exports：表示导出这个对象，这样webcontext框架才能自动引用到它，这个对象会自动从Context类继承,你不用编写任何extend或修改prototype的代码 ， webcontext框架内部实现了对/service目录下的文件自动添加路由和继承的功能。具体原理也非常简单，可以看下我的这篇文章->：[Node.js 实现类似于.php，.jsp的服务器页面技术，自动路由](https://juejin.im/post/5ccf00eae51d453b7f0a0d44)
2. async onLoad 函数：首先，这是一个异步函数，由于第3行代码访问数据库用了await，所以这里必须要加async关键字，然后onLoad是一个事件，也可以说是一个回调函数，它表示这个函数的代码是在后台接收到http请求后执行
3. this.database.insert， 由于当前文件自动继承自Context类,可以通过this获取到请求对象request、响应对象response，以及database对象，database对象封装了基本的curd操作。insert方法第一个参数表示要插入的表名，第二个参数是一个对象，表示要插入的字段名和字段值，为了便于测试，我们先用死数据测试一下 {  title:"hello",status:0}
4. this.render 将传入的字符串或对象输出到http响应。传入object的话会自动stringify。


写好之后，我们来访问http://localhost/service/todo/add.js，然后使用mysql workbench查看一下数据库，发现数据已经成功入库了。
测试成功后，我们把这行写死的数据改过来吧，this.request.data["title"]表示获取post表单中的title字段。

```js
await this.database.insert("todo_list",{  title:this.request.data["title"],status:0});
```
## select 
现在数据库里已经有数据了，我们要把请求mock的接口改成读取真实数据。删掉list.ejs（当然不删留着它做活口也是可以的）
在/service/todo目录新建一个list.js文件，书写代码如下：

/service/todo/list.js
```js
module.exports= {
    async onLoad() {
        var result=await this.database.select("todo_list")
        this.render(result); 
    }
}
```

不用过多解释了，套路和上一个页面一样，你唯一要改的就是把insert方法改成select方法，这个例子比较简单，只需要传一个表名就可以了。实际上select方法已经封装的非常强大，支持各种where条件、排序、数据库层分页、多表连接等，暂不展开讲述。

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
update和insert写法几乎一样，为了增加点新鲜感，第二个参数直接用this.request.data表单数据了，这样可以节省很多代码，但是如果别人恶意post不合法的数据的话你的代码会报错。

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
删除，只需要表名和id参数



# 第四次迭代，增加前端的添加，保存和删除逻辑,样式美化
 好了，现在CURD操作都已经完成了，业务代码只有8行，其实可以更少，因为mysql 加入了replace into语法，insert 和 update可以合二为一。即使加上一些参数的合法性校验，代码量也是非常少的。现在前后台分离之后，数据库业务的后台开发真的比前端要简单很多，除了一些多表连接和统计的sql语句比较难写之外，其它真的没有什么难度了。
 
 现在后台接口都完成了，但是添加、修改、删除的前端代码还没有实现，
```js
function saveItem(target){
    var li=$(target).parents("li");
        var id=li.attr("itemId")
        var title=li.find("input[type=textbox]").val();
        var status=li.find("input[type=checkbox]").prop("checked")?1:0;
        $.post("http://localhost/todo/update",{id:id,title:title,status:status},function (res){
            if(res.code="OK"){
                render();
            }
        });
}
function deleteItem(target){
    var id=$(target).parents("li").attr("itemId")
    $.post("http://localhost/todo/delete",{id:id},function (res){
        if(res.code="OK"){
            render();
        }
    });
}
$("#list").on("change","input[type=textbox]",function (e){
    saveItem(e.target);
})
$("#list").on("click","input[type=checkbox]",function (e){
    saveItem(e.target)
})
$("#list").on("click",".delete",function (e){
    deleteItem(e.target)
})
$("#btn_add").click("click",function (e){
    $.post("http://localhost/todo/add",{title:$("#title").val()},function (res){
        if(res.code="OK"){
            render();
        }
    });
})
```

# 第五次迭代 ，静态文件迁移到http服务器，完工

现在所有代码都已经完工，可是html和js文件总不能一直放在本地吧，webcontext已经内置了静态文件服务，只需要把本地的index.html和jquery.js存放在站点根目录下/frontend目录下，再来访问http://localhost/index.html，就可以访问到了。

最后，既然已经都在同一个http路径下了，可以把代码里$.post的绝对路径都改成相对路径。