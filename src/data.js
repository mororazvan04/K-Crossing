export const products = [
    {
        id: 1,
        name: "Neon Cyber Hoodie",
        category: "Hoodies",
        gender: "unisex", // <--- ADAUGAT
        price: 89.99,
        rating: 4.8,
        reviews: 124,
        isNew: true,
        onSale: false,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1000",
        images: [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=1000"
        ],
        description: "Engineered for the nocturnal wanderer.",
        specs: { "Material": "450GSM Cotton", "Fit": "Oversized" }
    },
    {
        id: 2,
        name: "Street Cargo Joggers",
        category: "Pants",
        gender: "men", // <--- ADAUGAT (Va declanșa mărimi numerice 30, 32...)
        price: 45.00,
        rating: 4.5,
        reviews: 89,
        isNew: false,
        onSale: true,
        image: "https://images.unsplash.com/photo-1552160793-ac2e8c65279c?auto=format&fit=crop&q=80&w=1000",
        images: [
            "https://images.unsplash.com/photo-1552160793-ac2e8c65279c?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=1000"
        ],
        description: "Tactical utility meets streetwear fluidity.",
        specs: { "Material": "Ripstop Nylon", "Pockets": "6" }
    },
    {
        id: 3,
        name: "K-Cross Oversized Tee",
        category: "T-Shirts",
        gender: "men", // <--- ADAUGAT
        price: 35.00,
        rating: 4.9,
        reviews: 450,
        isNew: true,
        onSale: false,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=1000",
        images: [
            "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=1000"
        ],
        description: "The foundation of the K-Crossing wardrobe.",
        specs: { "Material": "100% Cotton", "Print": "Puff Print" }
    },
    {
        id: 4,
        name: "Urban Bomber Jacket",
        category: "Jackets",
        gender: "women", // <--- ADAUGAT (Exemplu pentru Femei)
        price: 120.00,
        rating: 4.7,
        reviews: 56,
        isNew: false,
        onSale: false,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1000",
        images: [
            "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=1000",
            "https://images.unsplash.com/photo-1551028919-ac7675ef0c63?auto=format&fit=crop&q=80&w=1000"
        ],
        description: "Windproof satin-nylon shell.",
        specs: { "Shell": "Nylon", "Lining": "Quilted" }
    },
    {
        id: 5,
        name: "Tech-wear Vest",
        category: "Accessories",
        gender: "unisex", // <--- ADAUGAT
        price: 55.00,
        rating: 4.6,
        reviews: 32,
        isNew: false,
        onSale: true,
        image: "https://images.unsplash.com/photo-1512108927230-e379058b295f?auto=format&fit=crop&q=80&w=1000",
        images: [
            "https://images.unsplash.com/photo-1512108927230-e379058b295f?auto=format&fit=crop&q=80&w=1000"
        ],
        description: "Modular tactical vest.",
        specs: { "Material": "Ballistic Nylon" }
    }
];