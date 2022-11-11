import { connection } from "../../index";
import { quanLyDatVeService } from "../../services/QuanLyDatVeService";
import { ThongTinDatVe } from "../../_core/models/ThongTinDatVe";
import { CHUYEN_TAB, DAT_VE, DAT_VE_HOAN_TAT, LAY_CHI_TIET_PHONG_VE } from "../types/QuanLyDatVeType";
import { displayLoadingAction, hideLoadingAction } from "./LoadingAction";




export const layDanhSachPhongVeAction = (maLichChieu) => {
    

    return async (dispatch) => {
        try {
            //Sử dụng tham số thamSo
            const result = await quanLyDatVeService.layDanhSachPhongVe(maLichChieu);
            // console.log({result})
            if(result.status === 200){
                dispatch({
                    type: LAY_CHI_TIET_PHONG_VE,
                    chiTietPhongVe: result.data.content
                });

               
            }
            
        }catch (errors) {
            console.log('errors',errors.response.data)
        }
    };
}

export const datVeAction = (thongTinDatVe = new ThongTinDatVe()) => {


    return async (dispatch,getState) => {
        try {

            dispatch(displayLoadingAction)


            const result = await quanLyDatVeService.datVe(thongTinDatVe);
            console.log(result.data.content);
            //Đặt vé thành công gọi api load lại phòng vé
            await dispatch(layDanhSachPhongVeAction(thongTinDatVe.maLichChieu))
            await dispatch({type:DAT_VE_HOAN_TAT})
            await dispatch(hideLoadingAction);

            let userLogin = getState().QuanLyNguoiDungReducer.userLogin;
             connection.invoke('datGheThanhCong',userLogin.taiKhoan,thongTinDatVe.maLichChieu);

            dispatch({type:CHUYEN_TAB});


        } catch (error) {
            dispatch(hideLoadingAction)
            console.log(error.response.data);
        }
    }

}

export const datGheAction = (ghe,maLichChieu) => {


    return async (dispatch,getState) => {

        // console.log('ghe', ghe)
        //Đưa thông tin ghế lên reducer
        
        await dispatch({
            type: DAT_VE,
            gheDuocChon: ghe
        });

        //Call api về backend 
        let danhSachGheDangDat = getState().QuanLyDatVeReducer.danhSachGheDangDat;
        let taiKhoan = getState().QuanLyNguoiDungReducer.userLogin.taiKhoan;

        console.log('danhSachGheDangDat',danhSachGheDangDat);
        console.log('taiKhoan',taiKhoan);
        console.log('maLichChieu',maLichChieu);

        //Biến mảng thành chuỗi
        danhSachGheDangDat = JSON.stringify(danhSachGheDangDat);

        //Call api signalR
        connection.invoke('datGhe',taiKhoan,danhSachGheDangDat,maLichChieu);




    }

}
