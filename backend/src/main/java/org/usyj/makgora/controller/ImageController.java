package org.usyj.makgora.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ImageController {

    @Value("${cloudinary.cloud_name}")
    private String cloudName;

    @GetMapping("/api/resolve-image")
public String resolveImage(@RequestParam String path) {

    if (path == null || path.isEmpty()) return "";

    if (path.startsWith("http")) {
        return path;
    }

    return "https://res.cloudinary.com/" + cloudName + "/image/upload/" + path;
}
    
}