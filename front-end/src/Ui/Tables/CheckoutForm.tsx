import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;
    //const card = elements.getElement(CardElement);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: "http://localhost:3000/payment/success",
      },
      redirect: "if_required",
    });

    if (error) {
      console.error("❌ Payment error:", error.message);
    } else if (paymentIntent) {
      console.log("✅ Payment status:", paymentIntent.status);

      if (paymentIntent.status === "succeeded") {
        
         console.log("Paiement réussi");
         
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <button className="bg-neutral-600 mt-3 flex w-full justify-center py-2 rounded-lg font-semibold" disabled={!stripe}>
        Payer
      </button>
    </form>
  );
};

export default CheckoutForm;
