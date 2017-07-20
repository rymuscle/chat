/**
 * Created by renyimin on 2017/7/18.
 */
(function () {
    var d = document,
        w = window,
        p = parseInt,
        dd = d.documentElement,
        db = d.body;


    w.CHAT = {
        msgObj:d.getElementById("message"),
        username:null,
        userid:null,
        socket:null,

        //退出，本例只是一个简单的刷新
        logout:function(){
            location.reload();
        },
        //提交聊天消息内容
        submit:function(){
            var content = d.getElementById("content").value;
            if(content != ''){
                var obj = {
                    userid: this.userid,
                    username: this.username,
                    content: content
                };
                this.socket.emit('message', obj);
                d.getElementById("content").value = '';
            }
            return false;
        },
        //更新系统消息，本例中在用户加入、退出的时候调用
        updateSysMsg:function(o, action){
            //当前在线用户列表
            var onlineUsers = o.onlineUsers;
            //当前在线人数
            var onlineCount = o.onlineCount;
            //新加入用户的信息
            var user = o.user;

            //更新在线人数
            var userhtml = '';
            var separator = '';
            for(key in onlineUsers) {
                if(onlineUsers.hasOwnProperty(key)){
                    userhtml += separator+onlineUsers[key];
                    separator = '、';
                }
            }

            d.getElementById("onlinecount").innerHTML = '当前共有 '+onlineCount+' 人在线，在线列表：'+userhtml;
            //聊天界面展示系统消息 -- xxx加入／退出聊天室
            var html = '<div class="msg-system">' + user.username;
            html += (action == 'login') ? ' 加入了聊天室' : ' 退出了聊天室';
            html += '</div>';
            var section = d.createElement('section');
            section.className = 'system J-mjrlinkWrap J-cutMsg';
            section.innerHTML = html;
            this.msgObj.appendChild(section);
        },

        //用户提交用户名界面
        usernameSubmit:function(){
            var username = d.getElementById("username").value;
            //如果登陆,则做页面布局调整,并开始为连接websocket服务端错初始化工作
            if(username != ""){
                d.getElementById("username").value = '';
                d.getElementById("loginbox").style.display = 'none';
                d.getElementById("chatbox").style.display = 'block';
                this.init(username);
            }
            return false;
        },
        init:function(username){
            this.userid = new Date().getTime()+""+Math.floor(Math.random()*899+100);
            this.username = username;
            d.getElementById("showusername").innerHTML = this.username;

            //进入正题:
            //连接websocket后端服务器
            this.socket = io.connect('ws://127.0.0.1:3000');
            //告诉服务器端有用户登录
            this.socket.emit('login', {userid:this.userid, username:this.username});
            //监听新用户登录
            this.socket.on('login', function(o){
                CHAT.updateSysMsg(o, 'login');
            });
            //监听用户退出
            this.socket.on('logout', function(o){
                CHAT.updateSysMsg(o, 'logout');
            });
            //监听消息发送
            this.socket.on('message', function(obj){
                var isme = (obj.userid == CHAT.userid) ? true : false;
                var contentDiv = '<div>'+obj.content+'</div>';
                var usernameDiv = '<span>'+obj.username+'</span>';

                var section = d.createElement('section');
                if(isme){
                    section.className = 'user';
                    section.innerHTML = contentDiv + usernameDiv;
                } else {
                    section.className = 'service';
                    section.innerHTML = usernameDiv + contentDiv;
                }
                CHAT.msgObj.appendChild(section);
            });

        },
    };

    //通过“回车”提交用户名,聊天信息
    d.getElementById("username").onkeydown = function(e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.usernameSubmit();
        }
    };
    d.getElementById("content").onkeydown = function(e) {
        e = e || event;
        if (e.keyCode === 13) {
            CHAT.submit();
        }
    };
})();