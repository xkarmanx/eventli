export interface Service {
  id: number;
  title: string;
  price: string;
  location: string;
  provider: string;
  guests: string;
  staff: string;
  status: string;
  image: string;
}

export const mockServices: Service[] = [
  {
    id: 1,
    title: "Professional Wedding Services",
    price: "3000 - 30,000 CAD",
    location: "Calgary Northwest, Canada",
    provider: "EventGuys",
    guests: "Up to 40 guests",
    staff: "5 - 10 Staff",
    status: "Accepting",
    image: "/assets/samantha-gades-7J4T1XzpJgU-unsplash.jpg",
  },
  {
    id: 2,
    title: "Ceremony Services",
    price: "3000 - 30,000 CAD",
    location: "Calgary Northwest, Canada",
    provider: "EventGuys",
    guests: "Up to 40 guests",
    staff: "5 - 10 Staff",
    status: "Accepting",
    image: "/assets/yukiko-kanada-Ou4CQo6jzvU-unsplash.jpg",
  },
  {
    id: 3,
    title: "Professional Wedding Services",
    price: "3000 - 30,000 CAD",
    location: "Calgary Northwest, Canada",
    provider: "EventGuys",
    guests: "Up to 40 guests",
    staff: "5 - 10 Staff",
    status: "Accepting",
    image: "/assets/pexels-yankrukov-8867241 1.png",
  },
  {
    id: 4,
    title: "Graduation Ceremony Services",
    price: "3000 - 30,000 CAD",
    location: "Calgary Northwest, Canada",
    provider: "EventGuys",
    guests: "Up to 40 guests",
    staff: "5 - 10 Staff",
    status: "Accepting",
    image: "/assets/samantha-gades-7J4T1XzpJgU-unsplash.jpg",
  },
  {
    id: 5,
    title: "Christmas Festival Services",
    price: "3000 - 30,000 CAD",
    location: "Calgary Northwest, Canada",
    provider: "EventGuys",
    guests: "Up to 40 guests",
    staff: "5 - 10 Staff",
    status: "Accepting",
    image: "/assets/yukiko-kanada-Ou4CQo6jzvU-unsplash.jpg",
  },
  {
    id: 6,
    title: "Birthday Services",
    price: "3000 - 30,000 CAD",
    location: "Calgary Northwest, Canada",
    provider: "EventGuys",
    guests: "Up to 40 guests",
    staff: "5 - 10 Staff",
    status: "Accepting",
    image: "/assets/pexels-yankrukov-8867241 1.png",
  },
];

//to be replaced with actual data from the database