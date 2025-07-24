import { Heart, MessageCircle, Share2, Trophy, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface FeedItemProps {
  userName: string;
  userAvatar?: string;
  activity: string;
  location: string;
  suorEarned: number;
  timeAgo: string;
  likes: number;
  comments: number;
  achievement?: string;
}

const FeedItem = ({ 
  userName, 
  userAvatar, 
  activity, 
  location, 
  suorEarned, 
  timeAgo, 
  likes, 
  comments,
  achievement 
}: FeedItemProps) => {
  return (
    <Card className="card-agita">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{userName}</span>
              {achievement && (
                <div className="flex items-center gap-1 px-2 py-1 bg-warning/10 rounded-full">
                  <Trophy className="h-3 w-3 text-warning" />
                  <span className="text-xs text-warning font-medium">{achievement}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{activity}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
          <div className="suor-coin">
            +{suorEarned} SUOR
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <Heart className="h-4 w-4" />
              <span>{likes}</span>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
              <MessageCircle className="h-4 w-4" />
              <span>{comments}</span>
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const SocialFeed = () => {
  const feedItems = [
    {
      userName: "Maria Silva",
      activity: "Completou uma corrida de 5km",
      location: "Parque Ibirapuera, São Paulo",
      suorEarned: 150,
      timeAgo: "2h atrás",
      likes: 12,
      comments: 3,
      achievement: "Primeira corrida 5km!"
    },
    {
      userName: "João Santos",
      activity: "Pedalou 15km",
      location: "Ciclovia Marginal Pinheiros",
      suorEarned: 200,
      timeAgo: "4h atrás",
      likes: 8,
      comments: 1
    },
    {
      userName: "Ana Costa",
      activity: "Yoga no parque",
      location: "Parque Villa-Lobos",
      suorEarned: 80,
      timeAgo: "6h atrás",
      likes: 15,
      comments: 5
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Atividades dos Amigos</h3>
      {feedItems.map((item, index) => (
        <FeedItem key={index} {...item} />
      ))}
    </div>
  );
};

export default SocialFeed;