//mongodb model导出
//引入mongoose_connectdb_module.js到mongoose
const mongoose = require('./mg_connectdb_module');

//定义Schema

const Schema = mongoose.Schema;

//* 1.schema -----------------------------------------------------------

//定workScheduleSchema
const workScheduleSchema = new Schema({

    employeename: {
        type: String,
        maxlength: 12
    },
    employeenumber: {
        type: String,
        maxlength: 6
    },
    workdate: {
        type: Date,
        required: true
    },
    shift: {
        type: String,
        enum: ['am', 'pm']
    },
    createdate: Date,
    position: {
        type: String,
        enum: ["host", "bartender", "server", "busser", "trainee","reserved"]
    },
    remarks: {
        type: String,
        maxlength: 50
    },
    //posNum用于,职位名排序
    //设定预处理后得到的职位对应数字
    posNumber: {
        type: String
    }

});

//添加预处理行为

workScheduleSchema.pre('save', function (next) {
    if (this.position == "host") {
        this.posNumber = "1";
    } else if (this.position == "bartender") {
        this.posNumber = "2";
    } else if (this.position == "server") {
        this.posNumber = "3";
    } else if (this.position == "busser") {
        this.posNumber = "4";
    } else if (this.position == "trainee") {
        this.posNumber = "5";
    };
    
    next();
});


//* 2.schema-------------------------------------------------------------

//定义employeeSchema

const employeeSchema = new Schema({
    name: {
        type: String,
        required: true,
        maxlength: 12
    },
    number: {
        type: String,
        required: true,
        unique: true,
        maxlength: 6
    },
    date: {
        type: Date,
        default: new Date().toLocaleDateString(),
        required: true
    },
    position: {
        type: String,
        enum: ["host", "bartender", "server", "busser", "trainee", "unknown"],
        required: true
    },
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                // 检查 v 是否是 10 位数字
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} 不是一个有效的电话号码！`
        },
        unique: true,
        required: [true, '用户电话号码是必需的']
    },
    status: {
        type: String,
        default: "onJob",
        enum: ["onJob", "quit", "vacation", "partTime", "others", "unknown"],
        required: true
    },
    //设定预处理后得到的职位对应数字
    posNumber: {
        type: String
    },
    remarks: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        validate: {
            validator: function (v) {
                // 检查 v 是否是电子邮件格式的字符串
                return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))||v=="";
            }
        }
    },
    createdAt: {
        type: Date,
        expires: '1d',
        default: null
    }



});

//添加预处理行为

employeeSchema.pre('save', function (next) {
    if (this.position == "host") {
        this.posNumber = "1";
    } else if (this.position == "bartender") {
        this.posNumber = "2";
    } else if (this.position == "server") {
        this.posNumber = "3";
    } else if (this.position == "busser") {
        this.posNumber = "4";
    } else if (this.position == "trainee") {
        this.posNumber = "5";
    };
    if (this.name === "token") {
        this.createdAt = new Date();
        this.number = "";
        this.position = "unknown";
        this.status = "unknown";
        this.remarks = "The token number is for new employee to register personal information! Last 4 digit phone number is the code.";
        // this.date = new Date.setDate( new Date().getDate()+1).toLocaleDateString();
        let date = new Date();
        date.setDate(date.getDate() + 1);
        this.date = date.toLocaleDateString();
        let phone_tpr = this.phone.slice(-4);
        this.phone = '000000' + phone_tpr;

    }
    next();
});

//* 3.schema--------------------------------------------------------------

//定义userSchema

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        maxlength: 12
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                // 检查 v 是否是电子邮件格式的字符串
                return (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || v == "";
            }
        }
    },
    role:{
        type:String,
        enum:["administer","user","unknown"],
        default:"user"
    },
    token:{
        type:String
    }
});




//------------------------------------------------------------------------------
//定义model

const WorkSchedule = mongoose.model('workSchedule', workScheduleSchema);

const Employee = mongoose.model('employee', employeeSchema);

const User = mongoose.model('user', userSchema);


//------------------------------------------------------------------------------

//模块导出

module.exports = {
    WorkSchedule,
    Employee,
    User
};

// module.exports = workSchedule;
