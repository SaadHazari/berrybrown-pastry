import { useUI } from '../../store/ui';
import { Button, ButtonLink } from '../ui/Button';
import { WhatsAppIcon } from '../ui/Icons';
import { Sheet } from '../ui/Sheet';

export function SuccessOverlay() {
  const { overlay, close } = useUI();
  const data = overlay?.kind === 'success' ? overlay : null;

  return (
    <Sheet open={!!data} onClose={close} title={data?.paid ? 'Payment received' : 'Order sent'} variant="center">
      {data && (
        <div className="px-md pb-lg pt-md md:px-lg">
          <p className="t-body max-w-[40ch]">
            {data.paid ? 'Your payment went through. We will message you to confirm the details.' : 'Your order is ready in WhatsApp. Press send, and we will confirm and share payment details.'}
          </p>
          <p className="t-price mt-md">Ref {data.ref}</p>

          <div className="mt-lg flex flex-col gap-sm">
            {data.whatsappUrl && (
              <ButtonLink variant="claret" href={data.whatsappUrl} target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="size-[16px]" />
                {data.paid ? 'Send order details to our team' : 'Open WhatsApp again'}
              </ButtonLink>
            )}
            <Button variant="ghost" onClick={close}>
              Back to the site
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
