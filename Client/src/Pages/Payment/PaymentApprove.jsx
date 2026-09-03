import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader } from '../../components/Loader';
import { axiosClient } from '../../AxiosClient/axios';

const PaymentApprove = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing');

  const token = searchParams.get('token');
  const payerId = searchParams.get('PayerID');

  useEffect(() => {
    const approvePayment = async () => {
      if (!token || !payerId) {
        toast.error('Missing payment information');
        setStatus('error');
        setLoading(false);
        return;
      }

      try {
        // Call the API to approve the payment
        const response = await axiosClient.post(`/api/itemBooking/approve/${token}`, { payerId });


        if (response.status === 200) {
          setStatus('success');
          toast.success('Payment approved successfully!');

          // Redirect to success page after 2 seconds
          setTimeout(() => {
            navigate('/cart/success');
          }, 2000);
        } else {
          setStatus('error');
          toast.error(data.message || 'Payment approval failed');

          // Redirect to cart after 3 seconds
          setTimeout(() => {
            navigate('/cart');
          }, 3000);
        }
      } catch (error) {
        console.error('Payment approval error:', error);
        setStatus('error');
        toast.error('An error occurred while processing your payment');

        // Redirect to cart after 3 seconds
        setTimeout(() => {
          navigate('/cart');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    approvePayment();
  }, [token, payerId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader />
          <h2 className="mt-4 text-xl font-semibold text-gray-700">
            Processing your payment...
          </h2>
          <p className="mt-2 text-gray-500">
            Please don't close this window.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="w-16 h-16 mx-auto mb-4 text-green-500">
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 mb-4">
              Your booking has been confirmed and you will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to success page...
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 mx-auto mb-4 text-red-500">
              <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Payment Failed
            </h2>
            <p className="text-gray-600 mb-4">
              There was an issue processing your payment. Please try again.
            </p>
            <p className="text-sm text-gray-500">
              Redirecting back to cart...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentApprove;
