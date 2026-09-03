import React, { useState } from 'react';
import { Modal } from 'antd';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Star, Euro } from 'lucide-react';
import { toast } from 'sonner';
import { updateHotelPrice, updateHotelRating } from '../Api/hotel.api.js';

export const HotelUpdateModal = ({ 
  isOpen, 
  onClose, 
  hotel, 
  onSuccess, 
  updateType = 'price' // 'price' or 'rating' 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price: hotel?.price || '',
    pricePerNight: hotel?.pricePerNight || '',
    rating: hotel?.rating || 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(`Updating hotel ${updateType}...`);

    try {
      let res;
      if (updateType === 'price') {
        const priceData = {};
        if (formData.price) priceData.price = Number(formData.price);
        if (formData.pricePerNight) priceData.pricePerNight = Number(formData.pricePerNight);
        
        if (Object.keys(priceData).length === 0) {
          toast.error('Please provide at least one price value to update', { id: toastId });
          return;
        }
        
        res = await updateHotelPrice(hotel._id, priceData);
      } else if (updateType === 'rating') {
        if (!formData.rating || formData.rating < 0 || formData.rating > 5) {
          toast.error('Rating must be between 0 and 5', { id: toastId });
          return;
        }
        res = await updateHotelRating(hotel._id, Number(formData.rating));
      }

      if (res?.status === 200) {
        toast.success(`Hotel ${updateType} updated successfully!`, { id: toastId });
        onSuccess && onSuccess(res.data.data.hotel);
        onClose();
      } else {
        toast.error(`Failed to update hotel ${updateType}`, { id: toastId });
      }
    } catch (err) {
      const message = err?.response?.data?.message || err.message || `Failed to update hotel ${updateType}`;
      toast.error(message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const renderPriceForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="price" className="flex items-center">
          <Euro className="h-4 w-4 mr-2" />
          Base Price
        </Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChange}
          placeholder="Enter base price"
          className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="pricePerNight" className="flex items-center">
          <Euro className="h-4 w-4 mr-2" />
          Price Per Night
        </Label>
        <Input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          value={formData.pricePerNight}
          onChange={handleChange}
          placeholder="Enter price per night"
          className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
        />
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Price'}
        </Button>
      </div>
    </form>
  );

  const renderRatingForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="rating" className="flex items-center">
          <Star className="h-4 w-4 mr-2" />
          Hotel Rating
        </Label>
        <Input
          id="rating"
          name="rating"
          type="number"
          min="0"
          max="5"
          step="0.1"
          value={formData.rating}
          onChange={handleChange}
          placeholder="Enter rating (0-5)"
          className="transition-all focus:ring-2 focus:ring-black focus:scale-[1.01]"
        />
        <p className="text-sm text-gray-500">Rating should be between 0 and 5</p>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Rating'}
        </Button>
      </div>
    </form>
  );

  return (
    <Modal
      title={`Update Hotel ${updateType === 'price' ? 'Pricing' : 'Rating'}`}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      className="max-w-md"
    >
      <div className="py-4">
        {updateType === 'price' ? renderPriceForm() : renderRatingForm()}
      </div>
    </Modal>
  );
};
