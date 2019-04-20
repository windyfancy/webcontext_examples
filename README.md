# webcontext_examples
webcontext 使用示例，包含todolist的完整代码

# 安装使用步骤
1. 安装mysql 服务端和mysql workbench，设置数据库root密码
2. 用mysql workbench 连接数据库
3. mysql workbench 执行如下sql语句添加认证协议：
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '你的密码'
4. 通过工具栏 create a new schema 创建一个新的数据库todo_db
5. 修改web.config.json 中的数据库连接密码(database.password)
```js
{
    "port": "80",
    "database":{ 
        "host":"127.0.0.1",
        "port":"3306",
        "user":"root",
        "password":"你的密码",
        "database":"todo_db"
    }
}
 ```
 6. 创建一个表todo_list

 ```sql
 CREATE TABLE `todo_db`.`todo_list` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(45) NULL,
  `status` INT NULL,
  `createTime` VARCHAR(45) NULL,
  PRIMARY KEY (`id`));
  ```
7. 运行node app.js