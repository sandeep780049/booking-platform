import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { FileText, Award, Shield, Download, ExternalLink } from 'lucide-react';

export const HotelDocuments = ({ hotel }) => {
    const documents = [
        {
            id: 'license',
            label: 'Business License',
            icon: FileText,
            url: hotel.license,
            description: 'Official business operating license'
        },
        {
            id: 'certificate',
            label: 'Tax Certificate',
            icon: Award,
            url: hotel.certificate,
            description: 'Tax registration certificate'
        },
        {
            id: 'insurance',
            label: 'Insurance Document',
            icon: Shield,
            url: hotel.insurance,
            description: 'Property insurance documentation'
        }
    ];

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Documents & Certificates</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="license">
                        <TabsList className="grid grid-cols-3 mb-6">
                            {documents.map((doc) => (
                                <TabsTrigger key={doc.id} value={doc.id}>
                                    {doc.label.split(' ')[0]}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {documents.map((doc) => {
                            const Icon = doc.icon;
                            return (
                                <TabsContent key={doc.id} value={doc.id} className="space-y-4">
                                    <DocumentViewer 
                                        icon={Icon}
                                        label={doc.label}
                                        description={doc.description}
                                        url={doc.url}
                                    />
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </CardContent>
            </Card>

            {/* All Documents Grid View */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All Documents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {documents.map((doc) => {
                            const Icon = doc.icon;
                            return (
                                <Card key={doc.id} className="border">
                                    <CardContent className="pt-6">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <h3 className="font-medium mb-1">{doc.label}</h3>
                                            <p className="text-xs text-muted-foreground mb-4">{doc.description}</p>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(doc.url, '_blank')}
                                                    disabled={!doc.url}
                                                >
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const link = document.createElement('a');
                                                        link.href = doc.url;
                                                        link.download = `${doc.label}.pdf`;
                                                        link.click();
                                                    }}
                                                    disabled={!doc.url}
                                                >
                                                    <Download className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

const DocumentViewer = ({ icon: Icon, label, description, url }) => {
    return (
        <div className="space-y-4">
            <div className="aspect-[3/4] bg-muted rounded-md overflow-hidden border">
                {url ? (
                    <img
                        src={url}
                        alt={label}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.target.src = "/placeholder.svg?height=400&width=300";
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                            <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No document uploaded</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.open(url, '_blank')}
                        disabled={!url}
                    >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${label}.pdf`;
                            link.click();
                        }}
                        disabled={!url}
                    >
                        <Download className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
