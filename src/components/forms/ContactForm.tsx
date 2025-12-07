'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().min(10, 'Please enter a valid mobile number'),
  budget: z.string().min(1, 'Please select a budget range'),
  message: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const budgetValue = watch('budget')

  const onSubmit = async (data: ContactFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log('Form submitted:', data)
    toast.success('Message sent successfully! We\'ll get back to you soon.')
    reset()
  }

  return (
    <div className="w-full max-w-2xl p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Get Started Today</h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Let's make your business visible to AI agents
        </p>
      </div>
      <div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm sm:text-base">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Enter your name"
              {...register('name')}
              aria-invalid={errors.name ? 'true' : 'false'}
              className="h-11 sm:h-12 text-base"
            />
            {errors.name && (
              <p className="text-xs sm:text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile" className="text-sm sm:text-base">
              Mobile Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="Enter your mobile number"
              {...register('mobile')}
              aria-invalid={errors.mobile ? 'true' : 'false'}
              className="h-11 sm:h-12 text-base"
            />
            {errors.mobile && (
              <p className="text-xs sm:text-sm text-destructive">{errors.mobile.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm sm:text-base">
              Monthly Ads Budget <span className="text-destructive">*</span>
            </Label>
            <Select
              value={budgetValue}
              onValueChange={(value) => setValue('budget', value)}
            >
              <SelectTrigger
                id="budget"
                className="w-full h-11 sm:h-12 text-base"
                aria-invalid={errors.budget ? 'true' : 'false'}
              >
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-1k">Under $1,000</SelectItem>
                <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                <SelectItem value="50k-plus">$50,000+</SelectItem>
              </SelectContent>
            </Select>
            {errors.budget && (
              <p className="text-xs sm:text-sm text-destructive">{errors.budget.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm sm:text-base">Message</Label>
            <Textarea
              id="message"
              placeholder="Tell us about your business and goals..."
              rows={4}
              {...register('message')}
              className="resize-none text-base"
            />
          </div>

          <Button type="submit" className="w-full h-11 sm:h-12 text-base sm:text-lg font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all" size="lg" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      </div>
    </div>
  )
}

