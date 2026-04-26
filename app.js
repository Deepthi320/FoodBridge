import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, where, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDWRiHVu_c9QxESo7wcwIJJ8gQ6Sfv18DI",
    authDomain: "foodbridge2-6261a.firebaseapp.com",
    projectId: "foodbridge2-6261a",
    storageBucket: "foodbridge2-6261a.firebasestorage.app",
    messagingSenderId: "42768090988",
    appId: "1:42768090988:web:5db16f2028ac5e48d15549"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const foodRef = collection(db, "donations");

// 1. ADD DONATION (Includes Donor Name, Contact, and Urgency)
document.getElementById('foodForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const city = document.getElementById('cityInput').value.toLowerCase().trim();
    
    try {
        await addDoc(foodRef, {
            donorName: document.getElementById('donorName').value,
            contact: document.getElementById('contactNumber').value,
            item: document.getElementById('foodName').value,
            qty: document.getElementById('quantity').value,
            urgency: document.getElementById('urgencyLevel').value,
            city: city,
            status: "available",
            timestamp: new Date()
        });
        alert("Success! Your donation is now live for NGOs.");
        e.target.reset();
    } catch (err) {
        alert("Error: " + err.message);
    }
});

// 2. LIVE FILTERED FEED
window.updateFeed = () => {
    const cityFilter = document.getElementById('ngoCityFilter').value.toLowerCase().trim();
    const q = query(foodRef, where("city", "==", cityFilter), where("status", "in", ["available", "claimed"]));

    onSnapshot(q, (snapshot) => {
        const foodList = document.getElementById('foodList');
        foodList.innerHTML = "";
        
        snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const id = docSnap.id;
            const isClaimed = data.status === "claimed";
            const isUrgent = data.urgency === "Urgent";

            foodList.innerHTML += `
                <div class="donation-card ${isClaimed ? 'claimed-card' : ''} ${isUrgent ? 'urgent-card' : ''}">
                    <h3>${isUrgent ? '🚨 ' : ''}${data.item} (${data.qty})</h3>
                    <p><strong>Donor:</strong> ${data.donorName}</p>
                    <p><strong>Contact:</strong> <a href="tel:${data.contact}">${data.contact}</a></p>
                    <p><strong>Priority:</strong> ${data.urgency}</p>
                    <p>Status: <strong>${data.status.toUpperCase()}</strong></p>
                    <div style="margin-top:10px;">
                        ${!isClaimed 
                            ? `<button onclick="claimItem('${id}')">I'm on the way!</button>`
                            : `<button class="claimed-btn" onclick="collectItem('${id}')">Confirm Collection</button>`
                        }
                    </div>
                </div>
            `;
        });
    });
};

window.claimItem = async (id) => {
    await updateDoc(doc(db, "donations", id), { status: "claimed" });
};

window.collectItem = async (id) => {
    await updateDoc(doc(db, "donations", id), { status: "collected" });
};

updateFeed();