import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const AppDownloadSection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 border border-white/10 rounded-full"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/5 rounded-full"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div>
              <Badge className="bg-white/10 text-white border-white/20 mb-4">
                AVAILABLE ON ANDROID & APPS STORE
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Let's Find<br />
                The Right Courses For you
              </h2>
              <p className="text-white/80 max-w-lg">
                Download our app and start learning on the go. Access thousands of courses
                right from your mobile device.
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                size="lg"
                className="bg-black text-white border-white/20 hover:bg-white hover:text-black px-8 py-4 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📱</div>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Get it on</div>
                    <div className="font-semibold">Google play</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                size="lg"
                className="bg-black text-white border-white/20 hover:bg-white hover:text-black px-8 py-4 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🍎</div>
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on</div>
                    <div className="font-semibold">Apple Store</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>

          {/* Right Content - Device Mockup */}
          <div className="relative">
            <div className="relative max-w-md mx-auto">
              {/* Phone mockup */}
              <div className="bg-gray-200 rounded-3xl p-4 transform rotate-12 shadow-2xl">
                <div className="bg-white rounded-2xl p-4 aspect-[9/16]">
                  <div className="space-y-4">
                    {/* Top bar */}
                    <div className="h-8 bg-primary/10 rounded-lg"></div>
                    
                    {/* Hero section */}
                    <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">E</span>
                      </div>
                    </div>
                    
                    {/* Course cards */}
                    <div className="space-y-3">
                      <div className="h-16 bg-gray-100 rounded-lg"></div>
                      <div className="h-16 bg-gray-100 rounded-lg"></div>
                      <div className="h-16 bg-gray-100 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tablet mockup */}
              <div className="absolute -right-8 top-16 bg-gray-200 rounded-2xl p-3 transform -rotate-6 shadow-xl scale-75">
                <div className="bg-white rounded-xl p-3 aspect-[4/3]">
                  <div className="space-y-3">
                    <div className="h-6 bg-primary/10 rounded"></div>
                    <div className="h-20 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg"></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="h-12 bg-gray-100 rounded"></div>
                      <div className="h-12 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 left-4 w-8 h-8 bg-primary/20 rounded-full"></div>
              <div className="absolute bottom-8 -left-8 w-16 h-16 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppDownloadSection;