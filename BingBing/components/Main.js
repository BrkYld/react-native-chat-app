import React from 'react';
import axios from "../node_modules/axios";
import io from "socket.io-client";
class Main extends React.Component {
  constructor(props) {
    super(props);

  }
  componentDidMount() { //Sayfa ilk baslama aninda bu fonksiyonu calistirir.
    db.transaction((tx) => {
      tx.executeSql('Select* From User Where id = ?', [1], //User onceden login olmus mu ? Yerel veri tabanina (sqLite) sor
        (tx, results) => {
          if (results.rows.item(0).UserID == null) {
            isLogin = false;
            this.props.navigation.navigate('Login', { UserID: results.rows.item(0).UserID }); //Login olmamissa login sayfasina yonlendir.
          }
          else {
           
            var element = {
              _id: results.rows.item(0).UserID
            }
            axios({
              method: 'post',
              url: 'http://' + baseUrl +':4000/api/Test/Get',
              data: element
            }).then(result => {
              if (result.data.length == 0) {
                db.transaction((tx)=>{
                  tx.executeSql('UPDATE User SET UserId = NULL WHERE id = 1',[],
                  (tx,results)=>{    
                    isLogin = false;
                    this.props.navigation.navigate('Login', { UserID: null }); //Kullanici bilgileri MongoDb veritabaniyle eslesmiyorsa kullaniciyi sil ve Logine yonlendir.
                  });
              });
              }
              else { //Daha onceden Login olunmussa
                isLogin = true;
                if(socket == null){
                 socket = io('http://' + baseUrl +':4000/?UserID=' + results.rows.item(0).UserID); //Soket baglantisini ac
                }
                else{
                  console.log('Connected');
                }
                this.props.navigation.navigate('Lobby', { UserID: results.rows.item(0).UserID}); //Lobby sayfasina yonlendir
              }
            });

          }
        });
    });

  }
  render() {

    return (
      <>
  
      </>
    );
  }

}

export default Main;