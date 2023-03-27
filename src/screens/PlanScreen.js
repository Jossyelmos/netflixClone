import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, doc } from 'firebase/firestore';
import db from '../firebase';
import './PlanScreen.css';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { loadStripe } from '@stripe/stripe-js';

function PlanScreen() {
  const [products, setproducts] = useState([]);
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const docRef = doc(db, 'customers', user.uid);
    const colRef = collection(docRef, "subscriptions")

    const subs = async () => {
      const querySnapshot = await getDocs(colRef);

      querySnapshot.forEach(async (subscription) => {
        setSubscription({
          role: subscription.data().role,
          current_period_end: subscription.data().current_period_end.seconds,
          current_period_start: subscription.data().current_period_start.seconds
        });
      });
    };
    
    return subs;
  }, [user.uid]);

    useEffect(() => {
      const productCollection = query(collection(db, 'products'), where('active', '==', true));

      const productArray = async () => {
        const querySnapshot = await getDocs(productCollection);
        const products = {};
          
        querySnapshot.forEach(async (productDoc) => {
          products[productDoc.id] = productDoc.data();
          const priceSnap = await getDocs(collection(productDoc.ref, "prices"));
          priceSnap.docs.forEach((price) => {
            products[productDoc.id].prices = {
              priceId: price.id,
              priceData: price.data()
            }
          })
          setproducts(products);
        });
      };
      productArray();
    }, []);

  const loadCheckout = async (priceId) => {
    const docRef = doc(db, 'customers', user.uid);
    const colRef = collection(docRef, "checkout_sessions")
    addDoc(colRef, {
      price: priceId,
      success_url: window.location.origin,
      cancel_url: window.location.origin
    });
    const onSnapshot = await getDocs(colRef);

    const unSubscribe = onSnapshot.docs.map(async (snap) => {

        const { error, sessionId } = snap.data();

        if (error) {
          // Show an error to your customer and 
          // Inspect your cloud customer function logs in the firebase console
          alert(`An error occured: ${error.message}`);
        }

        if (sessionId) {
          // We have a session, let's redirect to checkout
          // init Stripe
          const stripeLoader = await loadStripe('pk_test_51Mckh9Edf7yAcFeqvwkdEbZEoXwQKfiLfepJ1Mv6nRvbgmjYJMEZAj8LlneVsSFhz2XKCTWqlPyKKD9uZ3dr7Sr100UDrNJ7XA');
          
          stripeLoader.redirectToCheckout({ sessionId });
        };
      });
      return unSubscribe();
  };
  
  return (
    <div className='planScreen'>
      <br />
      {subscription && <p>Renewal date: { new Date(subscription?.current_period_end * 1000).toLocaleDateString()}</p>}
      {Object.entries(products).map(([productId, productData]) => {
          //  add some logic to check if user's subscription is active...   
          const isCurrentPackage = productData.name?.toLowerCase().includes(subscription?.role);
          
        return (
            <div className={`${isCurrentPackage && "planScreen-plan--disabled"} planScreen-plan`} key={productId}>
              <div className="planScreen-info">
                <h5>{productData.name}</h5>
                <h6>{productData.description}</h6>
              </div>
            <button onClick={() => !isCurrentPackage && loadCheckout(productData
              .prices.priceId)}>
              {isCurrentPackage ? 'Current Package' : 'Subscribe'}
            </button>
            </div>
          )
        })}
    </div>
  )
}

export default PlanScreen;