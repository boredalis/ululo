import firebase from 'firebase'
import 'firebase/firestore'

// firebase init goes here
const config = {
    apiKey: "AIzaSyDKUKPuB4UkmMN8Etloe8jwAA8hbwXxsHE",
    authDomain: "ululo-8e895.firebaseapp.com",
    databaseURL: "https://ululo-8e895.firebaseio.com",
    projectId: "ululo-8e895",
    storageBucket: "ululo-8e895.appspot.com",
    messagingSenderId: "820417636866",
    appId: "1:820417636866:web:d27948d60e6e1169b5951b",
    measurementId: "G-7HEH0H0ZM0"
}

firebase.initializeApp(config)

let userData;
const getCurrentUser = async () => {
    if (userData) return Promise.resolve(userData)

    await firebase.auth().signInAnonymously().catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        console.error({ errorCode, errorMessage })
    });

    const { currentUser } = firebase.auth()
    return checkUserExistence(currentUser.uid)
    // if(currentUser) return Promise.resolve(currentUser)
}

const checkUserExistence = async (accountId) => {
    let existingUser = await db.collection('users').where('accountId', '==', accountId).get().then(res => {
        if (res.empty) return
        let formattedData;
        res.forEach(doc => formattedData = {
            id: doc.id,
            data: doc.data()
        })
        return formattedData
    })

    if (!existingUser) {
        existingUser = await db.collection('users').add({
                accountId
            }).then(r => r.get())
            .then(r => {
                return {
                    id: r.id,
                    data: r.data()
                }
            })
    }

    const { playlistId } = existingUser.data
    if (!playlistId) {
        const addedPlaylistId = await db.collection('playlists').add({
            playlistOwner: existingUser.id,
            currentSong: null,
            upcomingSongs: [],
            finishedSongs: [],
            likedSongs: [],
            collaborators: [],
        }).then(r => r.get()).then(res => res.id)
        existingUser = await db.collection('users').doc(existingUser.id).update({
            playlistId: addedPlaylistId,
            profile: null
        }).then(async () => {
            let res = await db.collection('users').doc(existingUser.id).get().then(doc => ({
                id: doc.id,
                data: doc.data()
            }))
            return res
        })
    }
    return existingUser
}

// firebase utils
const db = firebase.firestore()
const auth = firebase.auth()


// firebase collections
const usersCollection = db.collection('users')

export {
    db,
    auth,
    getCurrentUser
}