
const mongoose = require("mongoose");
const User = require("../models/User")
const TransactionHistory = require("../models/TransactionHistory")
const { STATUS, VIEWPOINT, ROLES } = require("../utils/enum");
const moment = require("moment/moment");
const { response } = require("express");

const AdminController = {
    updateStatus: async (req, res) => {
        try {

            const { userId, status } = req.body;
            const updateUser = await User.findByIdAndUpdate(userId, { status: status }, { new: true })

            if (updateUser)
                return res.status(200).json(updateUser)
            return res.status(400).json({ message: "Kích hoạt tài khoản thất bại" })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi kích hoạt tài khoản" })
        }
    },

    updateUserRole: async (req, res) => {
        try {

            const { username, role } = req.body;

            if (username) {
                const query = {
                    username: username.toString(), role: role.toString(), new: true
                }
                const newUser = await User.updateOne(query)
                if (newUser)
                    return res.status(200).json({ message: "Cập nhật quyền thành công" })

                else
                    return res.status(400).json({ message: "Cập nhật không thành công" })
            } else
                return res.status(400).json({ message: "Không có username" })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi cập nhật quyền tài khoản" })
        }
    },

    deleteUserById: async (req, res) => {
        try {

            const userId = req.query.id;
            const user = await User.findById(userId)
            if (!user)
                return res.status(400).json({
                    message: "Không tìn thấy người dùng!"
                })
            let name = user.fullname
            let deleteUser = User.findByIdAndDelete(userId)
            if (deleteUser)
                return res.status(200).json({
                    message: "Xóa người dùng " + name + " thành công!"
                })
            return res.status(200).json({
                message: "Xóa người dùng " + name + " thất bại!"
            })
        }
        catch (error) {
            console.log(error)
            return res.status(500).json({ message: "Lỗi xóa người dùng" })
        }
    },

    GetListUser: (req, res) => {
        try {

            User.find().sort({ fullname: -1 })
                .then(result => {
                    res.status(200).json(result)
                }).
                catch(err => {
                    console.log(err)
                    res.status(400).json({ message: "Lỗi lấy danh sách người dùng!" })
                })
        } catch (error) {
            console.log(error)
            res.status(400).json({ message: "Lỗi lấy danh sách người dùng" })
        }
    },



    UpdateTransactionStatus: async (req, res) => {
        try {
            const { transactionId, isTransferred } = req.body

            const transactionHistory = await TransactionHistory.findOneAndUpdate({ transactionId: transactionId }, { isTransferred }, { new: true })

            if (!transactionHistory)
                return res.status(400).json({ message: "Không tồn tại giao dịch!" })

            return res.status(200).json({ message: "Cập nhật trạng thái giao dịch thành công!" })
        } catch (error) {

        }
    },
    ViewTransactionHistory: async (req, res) => {
        try {
            const transactionHistory = await TransactionHistory.find({ status: STATUS.SUCCESS })
            if (transactionHistory.length <= 0)
                return res.status(400).json({ message: "Không tồn tại giao dịch!" })

            return res.status(200).json(transactionHistory)
        } catch (error) {

        }
    }


}
module.exports = { AdminController }