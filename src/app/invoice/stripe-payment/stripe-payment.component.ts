import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { loadStripe, Stripe, StripeCardElement, StripeElements, StripeCardElementOptions } from '@stripe/stripe-js';
import { EmployeeService } from '../../../services/code-mentore.service';

@Component({
  selector: 'app-stripe-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stripe-payment.component.html',
  styleUrls: ['./stripe-payment.component.css']
})
export class StripePaymentComponent implements OnInit {
  @Input() amount: number = 0;
  @Input() invoiceNumber: string = '';
  @Input() invoiceId: string = '';



  paymentForm: FormGroup;
  isProcessing = false;

  stripe!: Stripe | null;
  elements!: StripeElements;
  card!: StripeCardElement;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#d4af37',
        color: '#31325F',
        fontWeight: '400',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '16px',
        '::placeholder': { color: '#CFD7E0' }
      },
      invalid: {
        iconColor: '#dc3545',
        color: '#dc3545'
      }
    },
    hidePostalCode: false
  };

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private svc: EmployeeService
  ) {
    this.paymentForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  async ngOnInit() {
    const STRIPE_PUBLISHABLE_KEY = 'pk_test_51ShSc3GdisQz8MCdtvgxem1dTIuTkgxArTnaCD1gS9zW76DIMyLbZUyZqOO3Pc9ePXjWPU6F4Heu4B3yqI7FQ85h00EbY64zYs';

    try {
      this.stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);

      if (!this.stripe) {
        this.toastr.error('Failed to load Stripe');
        return;
      }

      this.elements = this.stripe.elements({ locale: 'en' });
      this.card = this.elements.create('card', this.cardOptions);
      this.card.mount('#card-element');

      this.card.on('change', (event) => {
        if (event.error) {
          this.toastr.warning(event.error.message, '', { timeOut: 3000 });
        }
      });
    } catch (error: any) {
      console.error('Stripe initialization error:', error);
      this.toastr.error('Failed to initialize payment form');
    }
  }

  async pay() {
    if (this.paymentForm.invalid) {
      this.toastr.warning('Please enter cardholder name');
      return;
    }

    if (!this.invoiceId) {
      this.toastr.error('Invoice ID is missing');
      return;
    }

    if (!this.stripe || !this.card) {
      this.toastr.error('Payment system not ready');
      return;
    }

    this.isProcessing = true;
    this.spinner.show();

    try {
      console.log('Creating payment intent for invoice:', this.invoiceId);

      // Step 1: Create Payment Intent
      const intentResponse: any = await this.svc.createPaymentIntent(this.invoiceId).toPromise();

      if (!intentResponse?.clientSecret) {
        throw new Error('Failed to create payment intent');
      }

      console.log('Payment intent created, confirming payment...');

      // Step 2: Confirm Card Payment
      const { paymentIntent, error } = await this.stripe.confirmCardPayment(
        intentResponse.clientSecret,
        {
          payment_method: {
            card: this.card,
            billing_details: {
              name: this.paymentForm.get('name')?.value
            }
          }
        }
      );

      if (error) {
        console.error('Payment error:', error);
        this.isProcessing = false;
        this.spinner.hide();
        this.toastr.error(error.message || 'Payment failed', '', { timeOut: 5000 });
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        console.log('Payment successful, confirming with backend...');

        // Step 3: Confirm payment with backend (creates transaction)
        this.svc.confirmPayment(paymentIntent.id, this.invoiceId).subscribe({
          next: (res) => {
            console.log('Backend confirmation successful:', res);
            this.isProcessing = false;
            this.spinner.hide();

            this.toastr.success('Payment confirmed!', '', { timeOut: 3000 });

            // Close modal and pass success result
            this.activeModal.close({
              success: true,
              paymentIntent,
              invoiceId: this.invoiceId,
              transaction: res.data?.transaction
            });
          },
          error: (err) => {
            console.error('Backend confirmation error:', err);
            this.isProcessing = false;
            this.spinner.hide();

            const errorMsg = err?.error?.message || 'Failed to record payment';
            this.toastr.error(errorMsg, '', { timeOut: 5000 });
          }
        });
      } else if (paymentIntent?.status === 'requires_action') {
        this.isProcessing = false;
        this.spinner.hide();
        this.toastr.warning('Additional authentication required');
      } else {
        this.isProcessing = false;
        this.spinner.hide();
        this.toastr.error('Payment was not completed. Status: ' + paymentIntent?.status);
      }

    } catch (err: any) {
      this.isProcessing = false;
      this.spinner.hide();
      console.error('Payment process error:', err);

      const errorMessage = err?.error?.message || err?.message || 'Payment failed. Please try again.';
      this.toastr.error(errorMessage, '', { timeOut: 5000 });
    }
  }

  ngOnDestroy() {
    if (this.card) {
      this.card.destroy();
    }
  }
}
