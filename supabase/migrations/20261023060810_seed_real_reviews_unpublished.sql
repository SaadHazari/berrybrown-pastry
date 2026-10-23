-- The 10 real reviews from docs/Berry_Brown_Testimonials.md §3. All hidden until the customer says yes.
-- created_at steps back one minute per row, so the site (newest first) shows them strongest first.
-- To publish one: update public.reviews set published = true where name = '<name>';
insert into public.reviews (created_at, name, area, cake, text, published) values
  (now(),                        'Kseniia',  'Wedding',      'Custom wedding cake', 'Best cake ever, it was delicious. Thank you so much, you completed our wedding perfect.', false),
  (now() - interval '1 minute',  'Cialymar', 'Event guest',  'Buttercream cake',    'I had a slice earlier and it was so good! Perfect sweetness and the buttercream was heaven!', false),
  (now() - interval '2 minutes', 'Joanna',   'Event cake',   'Raspberry cake',      'Omg, I just tried the cake finally. The raspberry, wow. It looked so beautiful.', false),
  (now() - interval '3 minutes', 'Joumana',  'Cake order',   'Earl Grey & Honey',   'Thank you for the Earl Grey tea and honey cake, it was so delicious.', false),
  (now() - interval '4 minutes', 'Afaf',     'Cake order',   'Custom cake',         'Gurl, the cake was AMAZING. It was TOO TASTY.', false),
  (now() - interval '5 minutes', 'Mou',      'Dubailand',    'Brownies',            'Amazing brownie. We liked the taste and texture.', false),
  (now() - interval '6 minutes', 'Claudia',  'Custom cake',  'Heart cake',          'So cute, thank you!', false),
  (now() - interval '7 minutes', 'Noora',    'Gift',         'Cake',                'Thank you so much for the thoughtful gesture and the lovely cake. It truly meant a lot to us.', false),
  (now() - interval '8 minutes', 'Tasneem',  'Fellow baker', 'Cake',                'I tried the cake, it was delicious.', false),
  (now() - interval '9 minutes', 'Achu',     'Friend',       'Cake',                'Super cake. Nice, fluffy and spongy. A different kind of flavour, a little tangy too. Someone here ate 4 pieces in one sitting.', false);
