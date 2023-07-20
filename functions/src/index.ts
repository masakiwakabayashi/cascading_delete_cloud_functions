import * as functions from "firebase-functions";
// firebase-adminをインポート
import * as admin from 'firebase-admin';
// firebase-adminの初期化
admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


// 科目が削除されたときに講師の担当科目を削除する処理
export const onSubjectDelete = functions.firestore
  .document('subjects/{subjectId}')
  .onDelete(async (snap, context) => {
    // 削除された科目のドキュメントIDを取得
    const deletedSubjectId = context.params.subjectId;
    // 講師のドキュメントを全て取得
    const db = admin.firestore();
    const teachers = db.collection(`teachers`);
    const teachersQuerySnapshot = await teachers.get();
    // 全ての講師のデータに対して繰り返しを行う
    const updates = teachersQuerySnapshot.docs.map(async (doc) => {
      const docData = doc.data();
      // docData.subjectInChargeが担当科目のリファレンス
      const subjectInCharge = docData.subjectInCharge;
      // 講師の担当科目と削除された科目が一致していた場合、その講師の担当科目を削除する
      if (deletedSubjectId == subjectInCharge.id) {
        // 講師の担当科目を削除する
        return doc.ref.update(
          { subjectInCharge: admin.firestore.FieldValue.delete() }
        );
      } else {
        // 何も更新しない場合でもPromiseを返す
        return Promise.resolve();
      }
    });
    return Promise.all(updates);
  });


