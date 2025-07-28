"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Navigation,
  CheckCircle,
  RotateCcw,
  Save,
  Plus,
  Edit,
  Trash2,
  Map,
  Languages,
  Satellite,
} from "lucide-react"

interface Corner {
  id: number
  latitude: number
  longitude: number
  accuracy: number
  timestamp: Date
}

interface Field {
  id: string
  name: string
  corners: Corner[]
  createdAt: Date
  area?: number
}

interface UserData {
  farmerId: string
  fields: Field[]
}

type Language = "en" | "bn"

const translations = {
  en: {
    // Dashboard
    myFields: "My Fields",
    noFieldsMapped: "No fields mapped yet",
    fieldsMapped: "field",
    fieldsMappedPlural: "fields mapped",
    addNewField: "Add New Field",
    yourFields: "Your Fields:",
    corners: "corners",

    // Field Collection
    markFieldCorners: "Mark Your Field Corners",
    minCorners: "Min 4",
    walkInstruction:
      "Walk to each corner of your field and tap 'Mark Corner'. Most fields need 4 corners — but you can add more if needed.",
    cornerSaved: "Corner",
    savedSuccessfully: "saved successfully!",
    accuracy: "Accuracy",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    firstFieldStart: "✅ Let's start with your first field! Walk to the first corner and mark it.",
    standAtCorner: "Stand at corner",
    ofYourField: "of your field and press the button below.",
    gettingLocation: "Getting Location...",
    markCorner: "Mark Corner",
    finishThisField: "Finish This Field",
    collectedCorners: "Collected Corners:",
    backToDashboard: "Back to Dashboard",

    // Field Naming
    nameYourField: "Name Your Field",
    giveFieldName: "Give this field a name to help identify it later",
    fieldSummary: "Field Summary",
    fieldPreview: "Field Preview",
    cornersCollected: "corners collected",
    boundaryReady: "Boundary polygon ready",
    collectedOn: "Collected on:",
    fieldNameOptional: "Field Name (Optional)",
    fieldPlaceholder: "Field",
    backToEdit: "Back to Edit",
    saveField: "Save Field",
    estimatedArea: "Estimated Area",
    hectares: "hectares",
    acres: "acres",
    satelliteView: "Satellite View",

    // Errors and Messages
    locationError: "Unable to get your location. Please check your GPS settings and try again.",
    geolocationNotSupported: "Geolocation is not supported by this browser",
    mapLoadError: "Unable to load map. Please check your internet connection.",

    // Language
    language: "Language",
    english: "English",
    bangla: "বাংলা",
  },
  bn: {
    // Dashboard
    myFields: "আমার জমি",
    noFieldsMapped: "এখনো কোনো জমি ম্যাপ করা হয়নি",
    fieldsMapped: "জমি",
    fieldsMappedPlural: "জমি ম্যাপ করা হয়েছে",
    addNewField: "নতুন জমি যোগ করুন",
    yourFields: "আপনার জমিসমূহ:",
    corners: "কোণ",

    // Field Collection
    markFieldCorners: "আপনার জমির কোণ চিহ্নিত করুন",
    minCorners: "সর্বনিম্ন ৪",
    walkInstruction:
      "আপনার জমির প্রতিটি কোণে গিয়ে 'কোণ চিহ্নিত করুন' বোতামে চাপুন। বেশিরভাগ জমির ৪টি কোণ থাকে — প্রয়োজনে আরো যোগ করতে পারেন।",
    cornerSaved: "কোণ",
    savedSuccessfully: "সফলভাবে সংরক্ষিত হয়েছে!",
    accuracy: "নির্ভুলতা",
    excellent: "চমৎকার",
    good: "ভালো",
    fair: "মোটামুটি",
    firstFieldStart: "✅ আপনার প্রথম জমি দিয়ে শুরু করি! প্রথম কোণে গিয়ে চিহ্নিত করুন।",
    standAtCorner: "আপনার জমির",
    ofYourField: "নম্বর কোণে দাঁড়িয়ে নিচের বোতামে চাপুন।",
    gettingLocation: "অবস্থান নির্ধারণ করা হচ্ছে...",
    markCorner: "কোণ চিহ্নিত করুন",
    finishThisField: "এই জমি সম্পন্ন করুন",
    collectedCorners: "সংগৃহীত কোণসমূহ:",
    backToDashboard: "ড্যাশবোর্ডে ফিরুন",

    // Field Naming
    nameYourField: "আপনার জমির নাম দিন",
    giveFieldName: "পরবর্তীতে চিহ্নিত করার জন্য এই জমির একটি নাম দিন",
    fieldSummary: "জমির সারসংক্ষেপ",
    fieldPreview: "জমির পূর্বরূপ",
    cornersCollected: "কোণ সংগ্রহ করা হয়েছে",
    boundaryReady: "সীমানা পলিগন প্রস্তুত",
    collectedOn: "সংগ্রহের তারিখ:",
    fieldNameOptional: "জমির নাম (ঐচ্ছিক)",
    fieldPlaceholder: "জমি",
    backToEdit: "সম্পাদনায় ফিরুন",
    saveField: "জমি সংরক্ষণ করুন",
    estimatedArea: "আনুমানিক এলাকা",
    hectares: "হেক্টর",
    acres: "একর",
    satelliteView: "স্যাটেলাইট ভিউ",

    // Errors and Messages
    locationError: "আপনার অবস্থান নির্ধারণ করা যাচ্ছে না। অনুগ্রহ করে আপনার GPS সেটিংস চেক করে আবার চেষ্টা করুন।",
    geolocationNotSupported: "এই ব্রাউজারে জিওলোকেশন সমর্থিত নয়",
    mapLoadError: "ম্যাপ লোড করা যাচ্ছে না। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ চেক করুন।",

    // Language
    language: "ভাষা",
    english: "English",
    bangla: "বাংলা",
  },
}

// Google Maps component for field visualization
const GoogleMapField = ({ corners, language }: { corners: Corner[]; language: Language }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const polygonRef = useRef<any | null>(null)
  const markersRef = useRef<any[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  const t = translations[language]

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true)
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyA-avAPc8cKrrEuHbP-_bKb68RzahbzCJQ&libraries=geometry`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      script.onerror = () => setMapError(true)
      document.head.appendChild(script)
    }

    loadGoogleMaps()
  }, [])

  // Initialize map when loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || corners.length === 0) return

    try {
      // Calculate center point
      const centerLat = corners.reduce((sum, corner) => sum + corner.latitude, 0) / corners.length
      const centerLng = corners.reduce((sum, corner) => sum + corner.longitude, 0) / corners.length

      // Initialize map
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 18,
        mapId: "6212edb7aca1dcc631eb150a", // Your Map ID for satellite view
        mapTypeId: "satellite",
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: "greedy",
      })

      mapInstanceRef.current = map

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.setMap(null))
      markersRef.current = []

      // Add corner markers
      corners.forEach((corner, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: corner.latitude, lng: corner.longitude },
          map: map,
          title: `${t.cornerSaved} ${corner.id}`,
          label: {
            text: corner.id.toString(),
            color: "white",
            fontWeight: "bold",
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: "#dc2626",
            fillOpacity: 1,
            strokeColor: "white",
            strokeWeight: 2,
          },
        })

        markersRef.current.push(marker)
      })

      // Create polygon if we have enough corners
      if (corners.length >= 3) {
        // Clear existing polygon
        if (polygonRef.current) {
          polygonRef.current.setMap(null)
        }

        const polygonCoords = corners.map((corner) => ({
          lat: corner.latitude,
          lng: corner.longitude,
        }))

        const polygon = new window.google.maps.Polygon({
          paths: polygonCoords,
          strokeColor: "#22c55e",
          strokeOpacity: 0.8,
          strokeWeight: 3,
          fillColor: "#22c55e",
          fillOpacity: 0.2,
        })

        polygon.setMap(map)
        polygonRef.current = polygon

        // Fit map to polygon bounds
        const bounds = new window.google.maps.LatLngBounds()
        corners.forEach((corner) => {
          bounds.extend({ lat: corner.latitude, lng: corner.longitude })
        })
        map.fitBounds(bounds)

        // Add some padding
        const listener = window.google.maps.event.addListener(map, "bounds_changed", () => {
          if (map.getZoom() && map.getZoom()! > 20) {
            map.setZoom(20)
          }
          window.google.maps.event.removeListener(listener)
        })
      }
    } catch (error) {
      console.error("Error initializing map:", error)
      setMapError(true)
    }
  }, [mapLoaded, corners, language])

  // Calculate area using Google Maps geometry library
  const calculateArea = () => {
    if (!mapLoaded || corners.length < 3) return 0

    try {
      const polygonCoords = corners.map((corner) => new window.google.maps.LatLng(corner.latitude, corner.longitude))

      const area = window.google.maps.geometry.spherical.computeArea(polygonCoords)
      return area / 10000 // Convert square meters to hectares
    } catch (error) {
      console.error("Error calculating area:", error)
      return 0
    }
  }

  const areaHectares = calculateArea()
  const areaAcres = areaHectares * 2.471

  if (mapError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600 text-sm">{t.mapLoadError}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
          <Satellite className="w-4 h-4" />
          {t.satelliteView}
        </h4>

        {/* Google Map */}
        <div className="bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
          <div ref={mapRef} className="w-full h-64" style={{ minHeight: "256px" }} />
          {!mapLoaded && (
            <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading satellite map...</p>
              </div>
            </div>
          )}
        </div>

        {/* Field statistics */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <p className="text-gray-600">{t.corners}</p>
            <p className="font-semibold text-lg">{corners.length}</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <p className="text-gray-600">{t.estimatedArea}</p>
            <p className="font-semibold text-lg">
              {areaHectares.toFixed(3)} {t.hectares}
            </p>
            <p className="text-xs text-gray-500">
              ({areaAcres.toFixed(3)} {t.acres})
            </p>
          </div>
        </div>

        {/* Corner coordinates */}
        <div className="mt-4">
          <h5 className="font-medium text-blue-800 mb-2">{t.collectedCorners}</h5>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {corners.map((corner) => (
              <div key={corner.id} className="flex items-center gap-2 text-xs bg-white p-2 rounded">
                <div className="w-3 h-3 bg-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {corner.id}
                </div>
                <span className="font-mono">
                  {corner.latitude.toFixed(6)}, {corner.longitude.toFixed(6)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MultiFieldCollector() {
  const [view, setView] = useState<"dashboard" | "collecting" | "preview" | "naming">("dashboard")
  const [fields, setFields] = useState<Field[]>([])
  const [currentField, setCurrentField] = useState<Field | null>(null)
  const [corners, setCorners] = useState<Corner[]>([])
  const [cornerCount, setCornerCount] = useState(1)
  const [isCollecting, setIsCollecting] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [fieldName, setFieldName] = useState("")
  const [language, setLanguage] = useState<Language>("en")

  const t = translations[language]

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "bn" : "en"))
  }

  const getCurrentLocation = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error(t.geolocationNotSupported))
        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      })
    })
  }

  const startNewField = () => {
    setCorners([])
    setCornerCount(1)
    setCurrentField(null)
    setFieldName("")
    setView("collecting")
  }

  const markCorner = async () => {
    setIsCollecting(true)
    setLocationError(null)

    try {
      const position = await getCurrentLocation()
      const newCorner: Corner = {
        id: cornerCount,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(),
      }

      setCorners((prev) => [...prev, newCorner])
      setAccuracy(position.coords.accuracy)
      setCornerCount((prev) => prev + 1)
    } catch (error) {
      setLocationError(t.locationError)
    } finally {
      setIsCollecting(false)
    }
  }

  const finishField = () => {
    if (corners.length >= 4) {
      setView("naming")
    }
  }

  const saveField = () => {
    const newField: Field = {
      id: `field_${Date.now()}`,
      name: fieldName || `${t.fieldPlaceholder} ${fields.length + 1}`,
      corners,
      createdAt: new Date(),
    }

    setFields((prev) => [...prev, newField])
    setView("dashboard")

    const userData: UserData = {
      farmerId: "farmer_123",
      fields: [...fields, newField],
    }
    localStorage.setItem("userData", JSON.stringify(userData))
  }

  const deleteField = (fieldId: string) => {
    setFields((prev) => prev.filter((field) => field.id !== fieldId))
  }

  const resetCollection = () => {
    setCorners([])
    setCornerCount(1)
  }

  const getAccuracyColor = (acc: number) => {
    if (acc <= 5) return "bg-green-500"
    if (acc <= 10) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getAccuracyText = (acc: number) => {
    if (acc <= 5) return t.excellent
    if (acc <= 10) return t.good
    return t.fair
  }

  const formatDate = (date: Date) => {
    if (language === "bn") {
      return date.toLocaleDateString("bn-BD")
    }
    return date.toLocaleDateString()
  }

  // Language Toggle Button
  const LanguageToggle = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="fixed top-4 right-4 z-50 flex items-center gap-2"
    >
      <Languages className="w-4 h-4" />
      {language === "en" ? t.bangla : t.english}
    </Button>
  )

  // Dashboard View
  if (view === "dashboard") {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <LanguageToggle />
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="w-6 h-6 text-green-600" />
              {t.myFields}
            </CardTitle>
            <CardDescription>
              {fields.length === 0
                ? t.noFieldsMapped
                : `${fields.length} ${fields.length > 1 ? t.fieldsMappedPlural : t.fieldsMapped}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={startNewField} className="w-full bg-green-600 hover:bg-green-700" size="lg">
              <Plus className="w-5 h-5 mr-2" />➕ {t.addNewField}
            </Button>

            {fields.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-600">{t.yourFields}</h4>
                {fields.map((field) => (
                  <Card key={field.id} className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium">{field.name}</h5>
                          <p className="text-sm text-gray-600">
                            {field.corners.length} {t.corners} • {formatDate(field.createdAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => deleteField(field.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Field Naming View with Google Maps
  if (view === "naming") {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <LanguageToggle />
        <Card>
          <CardHeader>
            <CardTitle>{t.nameYourField}</CardTitle>
            <CardDescription>{t.giveFieldName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Maps Visualization */}
            <GoogleMapField corners={corners} language={language} />

            {/* Field Summary */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">{t.fieldSummary}</h4>
              <div className="space-y-1 text-sm text-green-700">
                <p>
                  • {corners.length} {t.cornersCollected}
                </p>
                <p>• {t.boundaryReady}</p>
                <p>
                  • {t.collectedOn} {formatDate(new Date())}
                </p>
              </div>
            </div>

            {/* Field Name Input */}
            <div className="space-y-2">
              <Label htmlFor="fieldName">{t.fieldNameOptional}</Label>
              <Input
                id="fieldName"
                placeholder={`${t.fieldPlaceholder} ${fields.length + 1}`}
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setView("collecting")} className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                {t.backToEdit}
              </Button>
              <Button onClick={saveField} className="flex-1 bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                {t.saveField}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Corner Collection View
  if (view === "collecting") {
    return (
      <div className="max-w-md mx-auto p-4 space-y-6">
        <LanguageToggle />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t.markFieldCorners}</CardTitle>
              <Badge variant={corners.length >= 4 ? "default" : "secondary"}>
                {corners.length} / {t.minCorners}
              </Badge>
            </div>
            <CardDescription>{t.walkInstruction}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {corners.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">
                  ✅ {t.cornerSaved} {corners.length} {t.savedSuccessfully}
                </p>
                {accuracy !== null && (
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getAccuracyColor(accuracy)}`} />
                    <span className="text-sm text-gray-600">
                      {t.accuracy}: {accuracy.toFixed(1)}m ({getAccuracyText(accuracy)})
                    </span>
                  </div>
                )}
              </div>
            )}

            <Alert>
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                {corners.length === 0 ? t.firstFieldStart : `${t.standAtCorner} ${corners.length + 1} ${t.ofYourField}`}
              </AlertDescription>
            </Alert>

            {locationError && (
              <Alert variant="destructive">
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button onClick={markCorner} disabled={isCollecting} className="w-full" size="lg">
                {isCollecting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    {t.gettingLocation}
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 mr-2" />
                    {t.markCorner}
                  </>
                )}
              </Button>

              {corners.length >= 4 && (
                <Button onClick={finishField} variant="outline" className="w-full" size="lg">
                  <CheckCircle className="w-5 h-5 mr-2" />✅ {t.finishThisField}
                </Button>
              )}
            </div>

            {corners.length > 0 && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{t.collectedCorners}</h4>
                  <Button variant="ghost" size="sm" onClick={resetCollection}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {corners.map((corner) => (
                    <div key={corner.id} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>
                        {t.cornerSaved} {corner.id}: {corner.latitude.toFixed(6)}, {corner.longitude.toFixed(6)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <Button variant="ghost" onClick={() => setView("dashboard")} className="w-full">
                {t.backToDashboard}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
